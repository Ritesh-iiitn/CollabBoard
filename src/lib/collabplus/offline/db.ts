'use client';

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface CollabPlusDB extends DBSchema {
  yjs_docs: { key: string; value: { boardId: string; state: ArrayBuffer; updatedAt: number } };
  outbox: {
    key: string;
    value: {
      id: string;
      boardId: string;
      type: string;
      payload: Record<string, unknown>;
      status: 'PENDING' | 'ACKED' | 'FAILED';
      retries: number;
      createdAt: number;
    };
  };
  board_cache: {
    key: string;
    value: { boardId: string; meta: Record<string, unknown>; lastSequence: number };
  };
}

let dbPromise: Promise<IDBPDatabase<CollabPlusDB>> | null = null;

export function getOfflineDb() {
  if (!dbPromise) {
    dbPromise = openDB<CollabPlusDB>('collabboard-plus', 1, {
      upgrade(db) {
        db.createObjectStore('yjs_docs', { keyPath: 'boardId' });
        db.createObjectStore('outbox', { keyPath: 'id' });
        db.createObjectStore('board_cache', { keyPath: 'boardId' });
      },
    });
  }
  return dbPromise;
}
