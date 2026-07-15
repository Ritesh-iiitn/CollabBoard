import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        mermaid: `flowchart TD\n  A[${prompt}] --> B[Set OPENAI_API_KEY]`,
        note: 'Placeholder — configure OpenAI for full generation',
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Output only valid Mermaid code. No markdown fences.',
        },
        {
          role: 'user',
          content: `Generate use case / ER / class / sequence style Mermaid for: ${prompt}`,
        },
      ],
    });

    const mermaid = (res.choices[0]?.message?.content ?? '')
      .replace(/```mermaid\n?/g, '')
      .replace(/```/g, '')
      .trim();

    return NextResponse.json({ mermaid, prompt });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Diagram generation failed' }, { status: 500 });
  }
}
