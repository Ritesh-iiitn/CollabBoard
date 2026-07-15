import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { boardText } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ tasks: [], note: 'Set OPENAI_API_KEY for AI tasks' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate tasks JSON: { tasks: [{ title, priority: LOW|MEDIUM|HIGH, suggestedOwner, deadlineISO }] } from:\n${boardText ?? ''}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{"tasks":[]}');
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
