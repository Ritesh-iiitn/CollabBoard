import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/** CollabBoard++ — OpenAI meeting summary (existing Gemini routes unchanged) */
export async function POST(req: Request) {
  try {
    const { boardText, imageBase64 } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set — use existing /api/ai/summarizeVisionFull for Gemini' },
        { status: 503 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `Analyze this whiteboard session. Return JSON: summary, decisions[], risks[], actionItems[{title,priority}].

Content:
${boardText ?? ''}`,
      },
    ];

    if (imageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/png;base64,${imageBase64}`,
        },
      });
    }

    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
