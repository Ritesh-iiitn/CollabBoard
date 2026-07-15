'use client';

export async function track(
  name: string,
  properties?: Record<string, unknown> & { userId?: string; boardId?: string },
) {
  try {
    await fetch('/api/v1/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            name,
            userId: properties?.userId,
            boardId: properties?.boardId,
            properties: properties ?? {},
          },
        ],
      }),
    });
  } catch {
    // Non-blocking analytics
  }
}
