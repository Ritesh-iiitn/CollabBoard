import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async ingest(events: { name: string; userId?: string; boardId?: string; properties?: Record<string, unknown> }[]) {
    return this.prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        name: e.name,
        userId: e.userId,
        boardId: e.boardId,
        properties: e.properties as any,
      })),
    });
  }

  async dashboard() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalEvents, sessionStarts, aiCalls, topBoards] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.count({
        where: { name: 'board.session.start', createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.count({
        where: { name: { startsWith: 'ai.' }, createdAt: { gte: since } },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['boardId'],
        where: { boardId: { not: null }, createdAt: { gte: since } },
        _count: { boardId: true },
        orderBy: { _count: { boardId: 'desc' } },
        take: 10,
      }),
    ]);

    const uniqueUsers = await this.prisma.analyticsEvent.findMany({
      where: { userId: { not: null }, createdAt: { gte: since } },
      distinct: ['userId'],
      select: { userId: true },
    });

    return {
      period: '24h',
      totalEvents,
      dailyActiveUsers: uniqueUsers.length,
      sessionStarts,
      aiUsage: aiCalls,
      topBoards: topBoards.map((b) => ({ boardId: b.boardId, events: b._count.boardId })),
    };
  }
}
