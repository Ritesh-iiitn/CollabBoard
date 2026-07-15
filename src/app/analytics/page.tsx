'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Dashboard {
  period: string;
  totalEvents: number;
  dailyActiveUsers: number;
  sessionStarts: number;
  aiUsage: number;
  topBoards?: { boardId: string; events: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch('/api/v1/analytics/events')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/home" className="text-blue-400 hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold">CollabBoard++ Analytics</h1>
        <p className="mt-2 text-gray-400">
          Tracks sessions, AI usage, and board activity. Connect Nest API + Postgres for production
          aggregates.
        </p>
        {data && (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Period" value={data.period} />
            <Stat label="Events (24h)" value={String(data.totalEvents)} />
            <Stat label="DAU" value={String(data.dailyActiveUsers)} />
            <Stat label="Sessions" value={String(data.sessionStarts)} />
            <Stat label="AI calls" value={String(data.aiUsage)} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
