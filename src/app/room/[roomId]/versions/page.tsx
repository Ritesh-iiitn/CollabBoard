'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { socket } from '@/app/lib/socket';

interface VersionEvent {
  sequence: number;
  type: string;
  timestamp: string;
}

export default function VersionsPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [events, setEvents] = useState<VersionEvent[]>([]);

  useEffect(() => {
    socket.emit('event:replay', { roomId, fromSeq: 0 }, (res: { events: VersionEvent[] }) => {
      setEvents(res?.events ?? []);
    });
  }, [roomId]);

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <Link href={`/room/${roomId}`} className="text-blue-400 hover:underline">
        ← Back to board
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Version history — {roomId}</h1>
      <p className="mt-2 text-sm text-gray-400">
        Event log from CollabBoard++ (auto-snapshot every 50 events via Nest API when connected).
      </p>
      <ul className="mt-6 space-y-2">
        {events.length === 0 && <li className="text-gray-500">No events yet — draw on the board.</li>}
        {events.map((e) => (
          <li key={e.sequence} className="rounded border border-gray-800 bg-gray-900 px-4 py-2 text-sm">
            <span className="text-blue-400">#{e.sequence}</span> {e.type}{' '}
            <span className="text-gray-500">{e.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
