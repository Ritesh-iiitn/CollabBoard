'use client';

import { create } from 'zustand';

interface BoardStore {
  collabPlusEnabled: boolean;
  offline: boolean;
  lastEventSeq: number;
  activeTool: string;
  setCollabPlusEnabled: (v: boolean) => void;
  setOffline: (v: boolean) => void;
  setLastEventSeq: (n: number) => void;
  setActiveTool: (t: string) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  collabPlusEnabled: process.env.NEXT_PUBLIC_COLLAB_PLUS !== 'false',
  offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  lastEventSeq: 0,
  activeTool: 'pen',
  setCollabPlusEnabled: (collabPlusEnabled) => set({ collabPlusEnabled }),
  setOffline: (offline) => set({ offline }),
  setLastEventSeq: (lastEventSeq) => set({ lastEventSeq }),
  setActiveTool: (activeTool) => set({ activeTool }),
}));
