'use client';

import Link from 'next/link';
import { useBoardStore } from '@/stores/boardStore';

interface Props {
  roomId: string;
}

export default function CollabPlusToolbar({ roomId }: Props) {
  const { collabPlusEnabled, offline, setCollabPlusEnabled } = useBoardStore();

  return (
    <div className="fixed left-4 top-20 z-[60] flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-900/90 p-2 text-xs text-white">
      <span className="font-semibold text-blue-400">CollabBoard++</span>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={collabPlusEnabled}
          onChange={(e) => setCollabPlusEnabled(e.target.checked)}
        />
        CRDT + Offline
      </label>
      {offline && <span className="text-amber-400">Offline — queue active</span>}
      <Link href={`/room/${roomId}/versions`} className="text-blue-300 hover:underline">
        Version history
      </Link>
      <Link href="/analytics" className="text-blue-300 hover:underline">
        Analytics
      </Link>
    </div>
  );
}
