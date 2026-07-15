/**
 * CollabBoard++ socket extensions (Yjs sync, presence, event fan-out).
 * Loaded by server.js — does not replace existing handlers.
 */

/** @type {Map<string, Buffer[]>} */
const yjsRoomState = new Map();

/** @type {Map<string, Map<string, object>>} */
const presenceByRoom = new Map();

/** @type {Map<string, { events: object[]; seq: number }>} */
const eventLogByRoom = new Map();

function getYjsState(roomId) {
  if (!yjsRoomState.has(roomId)) yjsRoomState.set(roomId, []);
  return yjsRoomState.get(roomId);
}

function getPresenceRoom(roomId) {
  if (!presenceByRoom.has(roomId)) presenceByRoom.set(roomId, new Map());
  return presenceByRoom.get(roomId);
}

function getEventLog(roomId) {
  if (!eventLogByRoom.has(roomId)) {
    eventLogByRoom.set(roomId, { events: [], seq: 0 });
  }
  return eventLogByRoom.get(roomId);
}

/** Called from legacy server.js handlers to record domain events */
export function appendRoomEvent(roomId, type, payload, actorId = 'system') {
  const log = getEventLog(roomId);
  log.seq += 1;
  const envelope = {
    type,
    payload,
    actorId,
    sequence: log.seq,
    timestamp: new Date().toISOString(),
    clientId: '',
    version: 1,
  };
  log.events.push(envelope);
  return envelope;
}

/**
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function registerCollabPlusHandlers(io, socket) {
  socket.on('yjs:join', ({ roomId }) => {
    if (!roomId) return;
    socket.join(`yjs:${roomId}`);
    const updates = getYjsState(roomId);
    socket.emit('yjs:sync', { updates: updates.map((u) => u.toString('base64')) });
    const presence = getPresenceRoom(roomId);
    socket.emit('presence:sync', Array.from(presence.values()));
  });

  socket.on('yjs:update', ({ roomId, update }) => {
    if (!roomId || !update) return;
    const buf = Buffer.from(update, 'base64');
    getYjsState(roomId).push(buf);
    socket.to(`yjs:${roomId}`).emit('yjs:update', { update });
  });

  socket.on('presence:update', ({ roomId, state }) => {
    if (!roomId || !state?.userId) return;
    const room = getPresenceRoom(roomId);
    room.set(state.userId, { ...state, lastSeen: Date.now() });
    socket.to(roomId).emit('presence:update', state);
  });

  socket.on('presence:leave', ({ roomId, userId }) => {
    if (!roomId || !userId) return;
    getPresenceRoom(roomId).delete(userId);
    socket.to(roomId).emit('presence:leave', { userId });
  });

  socket.on('event:append', ({ roomId, event }) => {
    if (!roomId || !event) return;
    const log = getEventLog(roomId);
    log.seq += 1;
    const envelope = { ...event, sequence: log.seq, timestamp: new Date().toISOString() };
    log.events.push(envelope);
    io.to(roomId).emit('event:appended', envelope);
  });

  socket.on('event:replay', ({ roomId, fromSeq = 0 }, ack) => {
    const log = getEventLog(roomId);
    const events = log.events.filter((e) => e.sequence > fromSeq);
    if (typeof ack === 'function') ack({ events });
    else socket.emit('event:replay', { events });
  });

  socket.on('disconnect', () => {
    // Presence cleanup handled client-side via presence:leave when possible
  });
}

/**
 * Optional Redis adapter for horizontal scaling
 * @param {import('socket.io').Server} io
 */
export async function maybeAttachRedisAdapter(io) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return;

  try {
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { createClient } = await import('redis');
    const pub = createClient({ url: redisUrl });
    const sub = pub.duplicate();
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));
    console.log('[CollabBoard++] Redis Socket.IO adapter attached');
  } catch (err) {
    console.warn('[CollabBoard++] Redis adapter skipped:', err.message);
  }
}
