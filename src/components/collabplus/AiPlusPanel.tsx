'use client';

import { useState } from 'react';
import { track } from '@/lib/collabplus/analytics/track';

interface Props {
  roomId: string;
  getBoardText: () => string;
  getCanvasImage?: () => string | null;
}

export default function AiPlusPanel({ roomId, getBoardText, getCanvasImage }: Props) {
  const [summary, setSummary] = useState('');
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [mermaid, setMermaid] = useState('');
  const [diagramPrompt, setDiagramPrompt] = useState('Library Management System');
  const [loading, setLoading] = useState('');

  async function runMeetingSummary() {
    setLoading('summary');
    track('ai.summary.requested', { boardId: roomId });
    const res = await fetch('/api/v1/ai/meeting-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardId: roomId,
        boardText: getBoardText(),
        imageBase64: getCanvasImage?.() ?? undefined,
      }),
    });
    const data = await res.json();
    setSummary(typeof data.summary === 'string' ? data.summary : JSON.stringify(data, null, 2));
    setLoading('');
  }

  async function runActionItems() {
    setLoading('tasks');
    track('ai.action-items.requested', { boardId: roomId });
    const res = await fetch('/api/v1/ai/action-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: roomId, boardText: getBoardText() }),
    });
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading('');
  }

  async function runDiagram() {
    setLoading('diagram');
    track('ai.diagram.requested', { boardId: roomId });
    const res = await fetch('/api/v1/ai/diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: diagramPrompt }),
    });
    const data = await res.json();
    setMermaid(data.mermaid ?? '');
    setLoading('');
  }

  return (
    <div className="fixed right-4 top-20 z-[60] w-80 max-h-[80vh] overflow-y-auto rounded-xl border border-gray-700 bg-gray-900/95 p-4 text-sm text-gray-100 shadow-xl">
      <h3 className="mb-2 font-bold text-blue-400">CollabBoard++ AI</h3>
      <p className="mb-3 text-xs text-gray-400">
        Works alongside existing Gemini vision summary in the toolbar.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!!loading}
          onClick={runMeetingSummary}
          className="rounded bg-blue-600 px-3 py-2 hover:bg-blue-500 disabled:opacity-50"
        >
          Meeting Summary (OpenAI)
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={runActionItems}
          className="rounded bg-green-600 px-3 py-2 hover:bg-green-500 disabled:opacity-50"
        >
          Action Items
        </button>
        <input
          className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs"
          value={diagramPrompt}
          onChange={(e) => setDiagramPrompt(e.target.value)}
        />
        <button
          type="button"
          disabled={!!loading}
          onClick={runDiagram}
          className="rounded bg-purple-600 px-3 py-2 hover:bg-purple-500 disabled:opacity-50"
        >
          Mermaid Diagram
        </button>
      </div>
      {summary && (
        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-gray-800 p-2 text-xs">
          {summary}
        </pre>
      )}
      {tasks.length > 0 && (
        <ul className="mt-3 list-disc pl-4 text-xs">
          {(tasks as { title: string; priority: string }[]).map((t, i) => (
            <li key={i}>
              {t.title} ({t.priority})
            </li>
          ))}
        </ul>
      )}
      {mermaid && (
        <pre className="mt-3 max-h-48 overflow-auto rounded bg-gray-800 p-2 text-xs">{mermaid}</pre>
      )}
    </div>
  );
}
