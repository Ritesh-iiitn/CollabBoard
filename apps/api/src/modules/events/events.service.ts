import { Injectable } from '@nestjs/common';
import { SNAPSHOT_EVENT_INTERVAL } from '@collabboard/shared';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SnapshotsService } from '../snapshots/snapshots.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshots: SnapshotsService,
  ) {}

  async append(
    boardId: string,
    actorId: string,
    type: string,
    payload: Record<string, unknown>,
    clientId: string,
    eventId?: string,
  ) {
    if (eventId) {
      const existing = await this.prisma.boardEvent.findFirst({
        where: { boardId, payload: { path: ['eventId'], equals: eventId } },
      });
      if (existing) return existing;
    }

    const board = await this.prisma.board.update({
      where: { id: boardId },
      data: { lastEventSeq: { increment: 1 } },
    });

    const event = await this.prisma.boardEvent.create({
      data: {
        boardId,
        sequence: board.lastEventSeq,
        type,
        actorId,
        payload: { ...payload, eventId: eventId ?? undefined },
        clientId,
      },
    });

    if (board.lastEventSeq % SNAPSHOT_EVENT_INTERVAL === 0) {
      await this.snapshots.maybeAutoSnapshot(boardId, board.lastEventSeq);
    }

    return event;
  }

  async list(boardId: string, fromSeq = 0) {
    return this.prisma.boardEvent.findMany({
      where: { boardId, sequence: { gt: fromSeq } },
      orderBy: { sequence: 'asc' },
    });
  }

  /** Replay events into a reducer (client or server) */
  async replay<T>(boardId: string, fromSeq: number, reducer: (state: T, event: { type: string; payload: unknown }) => T, initial: T): Promise<T> {
    const events = await this.list(boardId, fromSeq);
    return events.reduce((state, e) => reducer(state, { type: e.type, payload: e.payload }), initial);
  }
}
