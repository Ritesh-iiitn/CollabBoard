'use client';

import { useCallback, useEffect, useState } from 'react';
import { socket } from '@/app/lib/socket';
import type { PresenceState, PresenceStatus, PresenceTool } from '@/lib/collabplus/types';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

export function usePresence(roomId: string, userId: string, name: string) {
  const [others, setOthers] = useState<PresenceState[]>([]);
  const color = COLORS[userId.charCodeAt(0) % COLORS.length];

  const publish = useCallback(
    (partial: Partial<PresenceState>) => {
      const state: PresenceState = {
        userId,
        name,
        color,
        cursor: null,
        viewport: { x: 0, y: 0, zoom: 1 },
        activeTool: 'pen',
        status: 'viewing',
        lastSeen: Date.now(),
        ...partial,
      };
      socket.emit('presence:update', { roomId, state });
    },
    [roomId, userId, name, color],
  );

  useEffect(() => {
    const onSync = (list: PresenceState[]) => {
      setOthers(list.filter((p) => p.userId !== userId));
    };
    const onUpdate = (state: PresenceState) => {
      if (state.userId === userId) return;
      setOthers((prev) => {
        const next = prev.filter((p) => p.userId !== state.userId);
        return [...next, state];
      });
    };
    const onLeave = ({ userId: left }: { userId: string }) => {
      setOthers((prev) => prev.filter((p) => p.userId !== left));
    };

    socket.on('presence:sync', onSync);
    socket.on('presence:update', onUpdate);
    socket.on('presence:leave', onLeave);

    publish({ status: 'viewing' });

    return () => {
      socket.emit('presence:leave', { roomId, userId });
      socket.off('presence:sync', onSync);
      socket.off('presence:update', onUpdate);
      socket.off('presence:leave', onLeave);
    };
  }, [roomId, userId, publish]);

  const setCursor = (x: number, y: number) => publish({ cursor: { x, y }, status: 'drawing' as PresenceStatus });
  const setTool = (activeTool: PresenceTool) => publish({ activeTool });
  const setStatus = (status: PresenceStatus) => publish({ status });

  return { others, setCursor, setTool, setStatus, color };
}
