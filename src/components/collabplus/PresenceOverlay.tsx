'use client';

import { usePresence } from '@/lib/collabplus/presence/usePresence';

interface Props {
  roomId: string;
  userId: string;
  name: string;
}

export default function PresenceOverlay({ roomId, userId, name }: Props) {
  const { others } = usePresence(roomId, userId, name);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {others.map((p) =>
        p.cursor ? (
          <div
            key={p.userId}
            className="absolute flex items-center gap-1 transition-transform duration-75"
            style={{ left: p.cursor.x, top: p.cursor.y }}
          >
            <div
              className="h-3 w-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: p.color }}
            />
            <span
              className="rounded px-1.5 py-0.5 text-xs text-white shadow"
              style={{ backgroundColor: p.color }}
            >
              {p.name} · {p.status}
            </span>
          </div>
        ) : null,
      )}
    </div>
  );
}
