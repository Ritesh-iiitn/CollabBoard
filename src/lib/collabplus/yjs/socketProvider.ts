'use client';

import * as Y from 'yjs';
import { socket } from '@/app/lib/socket';
import { applyUpdate, encodeUpdate } from './boardDoc';

export function connectYjsToSocket(roomId: string, doc: Y.Doc) {
  socket.emit('yjs:join', { roomId });

  const onSync = (payload: { updates: string[] }) => {
    payload.updates?.forEach((u) => applyUpdate(doc, u));
  };

  const onUpdate = (payload: { update: string }) => {
    if (payload.update) applyUpdate(doc, payload.update);
  };

  const localHandler = (update: Uint8Array, origin: unknown) => {
    if (origin === 'remote') return;
    let binary = '';
    update.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    socket.emit('yjs:update', { roomId, update: btoa(binary) });
  };

  socket.on('yjs:sync', onSync);
  socket.on('yjs:update', onUpdate);
  doc.on('update', localHandler);

  return () => {
    socket.off('yjs:sync', onSync);
    socket.off('yjs:update', onUpdate);
    doc.off('update', localHandler);
  };
}

export function syncFullState(roomId: string, doc: Y.Doc) {
  socket.emit('yjs:update', { roomId, update: encodeUpdate(doc) });
}
