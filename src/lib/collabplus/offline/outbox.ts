'use client';

import { getOfflineDb } from './db';
import { socket } from '@/app/lib/socket';

export async function enqueueEvent(
  boardId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  const db = await getOfflineDb();
  const id = crypto.randomUUID();
  await db.put('outbox', {
    id,
    boardId,
    type,
    payload: { ...payload, eventId: id },
    status: 'PENDING',
    retries: 0,
    createdAt: Date.now(),
  });
  return id;
}

export async function flushOutbox(boardId: string) {
  const db = await getOfflineDb();
  const all = await db.getAll('outbox');
  const pending = all.filter((e) => e.boardId === boardId && e.status === 'PENDING');

  for (const item of pending) {
    try {
      socket.emit('event:append', {
        roomId: boardId,
        event: { type: item.type, payload: item.payload, eventId: item.id },
      });
      await db.put('outbox', { ...item, status: 'ACKED' });
    } catch {
      await db.put('outbox', { ...item, retries: item.retries + 1, status: 'FAILED' });
    }
  }
}

export function subscribeOnlineSync(boardId: string) {
  const onOnline = () => flushOutbox(boardId);
  window.addEventListener('online', onOnline);
  return () => window.removeEventListener('online', onOnline);
}
