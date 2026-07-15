import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, title?: string) {
    return this.prisma.board.create({
      data: {
        title: title ?? 'Untitled Board',
        ownerId,
        members: { create: { userId: ownerId, role: Role.OWNER } },
      },
      include: { members: true },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.board.findMany({
      where: { members: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      include: { members: { where: { userId } } },
    });
  }

  async get(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async addMember(boardId: string, userId: string, role: Role = Role.EDITOR) {
    return this.prisma.boardMember.upsert({
      where: { boardId_userId: { boardId, userId } },
      create: { boardId, userId, role },
      update: { role },
    });
  }
}
