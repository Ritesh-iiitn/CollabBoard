import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const boardId = req.params.boardId ?? req.params.id;
    const userId = req.user?.userId;
    if (!boardId || !userId) return false;

    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) {
      const board = await this.prisma.board.findUnique({ where: { id: boardId } });
      if (!board) throw new NotFoundException('Board not found');
      throw new ForbiddenException('Not a board member');
    }
    req.boardRole = member.role;
    return true;
  }
}

export function requireRole(...roles: Role[]) {
  return (req: { boardRole?: Role }) => {
    if (!req.boardRole || !roles.includes(req.boardRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  };
}
