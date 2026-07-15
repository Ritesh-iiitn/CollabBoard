'use client';

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

const docs = new Map<string, Y.Doc>();

export function getBoardDoc(boardId: string): Y.Doc {
  if (!docs.has(boardId)) {
    const doc = new Y.Doc();
    doc.getMap('meta');
    doc.getMap('objects');
    doc.getArray('layers');
    docs.set(boardId, doc);
  }
  return docs.get(boardId)!;
}

export function bindIndexedDbPersistence(boardId: string, doc: Y.Doc) {
  return new IndexeddbPersistence(`collabboard-${boardId}`, doc);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeUpdate(doc: Y.Doc): string {
  return toBase64(Y.encodeStateAsUpdate(doc));
}

export function applyUpdate(doc: Y.Doc, updateBase64: string) {
  Y.applyUpdate(doc, fromBase64(updateBase64), 'remote');
}
