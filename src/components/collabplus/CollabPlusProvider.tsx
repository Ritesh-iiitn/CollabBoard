'use client';

import { useEffect, type ReactNode } from 'react';
import { getBoardDoc, bindIndexedDbPersistence } from '@/lib/collabplus/yjs/boardDoc';
import { connectYjsToSocket } from '@/lib/collabplus/yjs/socketProvider';
import { subscribeOnlineSync } from '@/lib/collabplus/offline/outbox';
import { track } from '@/lib/collabplus/analytics/track';
import { useBoardStore } from '@/stores/boardStore';

interface Props {
  roomId: string;
  userId: string;
  children: ReactNode;
}

/** Wraps existing Whiteboard with Yjs, offline, analytics — does not replace it */
export default function CollabPlusProvider({ roomId, userId, children }: Props) {
  const enabled = useBoardStore((s) => s.collabPlusEnabled);
  const setOffline = useBoardStore((s) => s.setOffline);

  useEffect(() => {
    if (!enabled) return;

    const doc = getBoardDoc(roomId);
    const persistence = bindIndexedDbPersistence(roomId, doc);
    const disconnectYjs = connectYjsToSocket(roomId, doc);

    track('board.session.start', { boardId: roomId, userId });

    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      disconnectYjs();
      persistence.destroy();
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      track('board.session.end', { boardId: roomId, userId });
    };
  }, [roomId, userId, enabled, setOffline]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeOnlineSync(roomId);
  }, [roomId, enabled]);

  return <>{children}</>;
}
