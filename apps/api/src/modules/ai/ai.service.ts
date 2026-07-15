import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  private get client(): OpenAI {
    if (!this.openai) throw new Error('OPENAI_API_KEY not configured');
    return this.openai;
  }

  async meetingSummary(boardId: string, boardText: string, imageBase64?: string) {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: `Analyze this collaborative whiteboard session.

Board text content:
${boardText}

Return JSON with keys: summary, decisions (array), risks (array), actionItems (array of {title, priority}).`,
      },
    ];
    if (imageBase64) {
      content.push({
        type: 'image_url',
        image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}` },
      });
    }

    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
    const artifact = await this.prisma.aiArtifact.create({
      data: {
        boardId,
        type: 'MEETING_SUMMARY',
        content: parsed,
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      },
    });
    return { ...parsed, artifactId: artifact.id };
  }

  async actionItems(boardId: string, boardText: string) {
    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `From this whiteboard content, generate actionable tasks as JSON: { tasks: [{ title, priority: LOW|MEDIUM|HIGH, suggestedOwner, deadlineISO }] }

Content:
${boardText}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{"tasks":[]}');
    const tasks = await Promise.all(
      (parsed.tasks ?? []).map((t: { title: string; priority: string; suggestedOwner?: string; deadlineISO?: string }) =>
        this.prisma.task.create({
          data: {
            boardId,
            title: t.title,
            priority: t.priority ?? 'MEDIUM',
            dueDate: t.deadlineISO ? new Date(t.deadlineISO) : undefined,
            source: 'AI',
          },
        }),
      ),
    );
    return { tasks, parsed };
  }

  async generateDiagram(prompt: string) {
    const res = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You output only valid Mermaid diagram code. No markdown fences. Support classDiagram, erDiagram, sequenceDiagram, flowchart.',
        },
        {
          role: 'user',
          content: `Generate a Mermaid diagram for: ${prompt}. Prefer multiple diagram types if asked (use separate diagrams in comments).`,
        },
      ],
    });

    const mermaid = (res.choices[0]?.message?.content ?? '').replace(/```mermaid\n?/g, '').replace(/```/g, '').trim();
    return { mermaid, prompt };
  }
}
