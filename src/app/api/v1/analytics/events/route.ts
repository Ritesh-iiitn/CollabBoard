import { NextResponse } from 'next/server';

const memoryEvents: {
  name: string;
  userId?: string;
  boardId?: string;
  properties: Record<string, unknown>;
  createdAt: string;
}[] = [];

/** In-memory analytics fallback; Nest API persists to Postgres when running */
export async function POST(req: Request) {
  try {
    const { events } = await req.json();
    const batch = (events ?? []).map(
      (e: { name: string; userId?: string; boardId?: string; properties?: Record<string, unknown> }) => ({
        ...e,
        properties: e.properties ?? {},
        createdAt: new Date().toISOString(),
      }),
    );
    memoryEvents.push(...batch);

    const apiUrl = process.env.COLLAB_API_URL;
    if (apiUrl) {
      await fetch(`${apiUrl}/api/v1/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, count: batch.length });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function GET() {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recent = memoryEvents.filter((e) => new Date(e.createdAt).getTime() >= since);
  const users = new Set(recent.map((e) => e.userId).filter(Boolean));
  return NextResponse.json({
    period: '24h',
    totalEvents: recent.length,
    dailyActiveUsers: users.size,
    sessionStarts: recent.filter((e) => e.name === 'board.session.start').length,
    aiUsage: recent.filter((e) => e.name.startsWith('ai.')).length,
    events: recent.slice(-100),
  });
}
