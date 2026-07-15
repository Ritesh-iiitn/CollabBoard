import { Injectable } from '@nestjs/common';
import { SNAPSHOT_TIME_MS } from '@collabboard/shared';
import { SnapshotTrigger } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SnapshotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, createdById: string, yjsState: Buffer, sequence: number, trigger: SnapshotTrigger, label?: string) {
    const snap = await this.prisma.boardSnapshot.create({
      data: { boardId, sequence, yjsState, createdById, trigger, label },
    });
    await this.prisma.board.update({
      where: { id: boardId },
      data: { lastSnapshotSeq: sequence, lastSnapshotAt: new Date() },
    });
    return snap;
  }

  async list(boardId: string) {
    return this.prisma.boardSnapshot.findMany({
      where: { boardId },
      orderBy: { sequence: 'desc' },
    });
  }

  async maybeAutoSnapshot(boardId: string, sequence: number) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) return;
    const timeSince = board.lastSnapshotAt
      ? Date.now() - board.lastSnapshotAt.getTime()
      : SNAPSHOT_TIME_MS + 1;
    if (timeSince < SNAPSHOT_TIME_MS) return;

    const latest = await this.prisma.boardUpdate.findFirst({
      where: { boardId },
      orderBy: { sequence: 'desc' },
    });
    if (!latest) return;

    await this.create(boardId, board.ownerId, Buffer.from(latest.yjsUpdate), sequence, SnapshotTrigger.AUTO);
  }

  async restore(boardId: string, snapshotId: string) {
    const snap = await this.prisma.boardSnapshot.findFirst({
      where: { id: snapshotId, boardId },
    });
    if (!snap) return null;
    await this.prisma.boardUpdate.create({
      data: {
        boardId,
        sequence: snap.sequence,
        yjsUpdate: snap.yjsState,
      },
    });
    return snap;
  }

  async compare(boardId: string, fromId: string, toId: string) {
    const [from, to] = await Promise.all([
      this.prisma.boardSnapshot.findFirst({ where: { id: fromId, boardId } }),
      this.prisma.boardSnapshot.findFirst({ where: { id: toId, boardId } }),
    ]);
    return {
      from: from ? { id: from.id, sequence: from.sequence, createdAt: from.createdAt } : null,
      to: to ? { id: to.id, sequence: to.sequence, createdAt: to.createdAt } : null,
      sequenceDelta: (to?.sequence ?? 0) - (from?.sequence ?? 0),
    };
  }
}
