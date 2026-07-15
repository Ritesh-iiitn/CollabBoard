import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { SnapshotTrigger } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BoardMemberGuard, requireRole } from '../../common/guards/board-member.guard';
import { Role } from '@prisma/client';
import { SnapshotsService } from './snapshots.service';

@Controller('boards/:boardId/snapshots')
@UseGuards(JwtAuthGuard, BoardMemberGuard)
export class SnapshotsController {
  constructor(private readonly snapshots: SnapshotsService) {}

  @Get()
  list(@Param('boardId') boardId: string) {
    return this.snapshots.list(boardId);
  }

  @Get('compare')
  compare(
    @Param('boardId') boardId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.snapshots.compare(boardId, from, to);
  }

  @Post()
  create(
    @Param('boardId') boardId: string,
    @Req() req: { user: { userId: string }; boardRole: Role },
    @Body() body: { yjsStateBase64: string; sequence: number; label?: string },
  ) {
    requireRole(Role.OWNER, Role.EDITOR)(req);
    const buf = Buffer.from(body.yjsStateBase64, 'base64');
    return this.snapshots.create(
      boardId,
      req.user.userId,
      buf,
      body.sequence,
      SnapshotTrigger.MANUAL,
      body.label,
    );
  }

  @Post(':snapshotId/restore')
  restore(
    @Param('boardId') boardId: string,
    @Param('snapshotId') snapshotId: string,
    @Req() req: { boardRole: Role },
  ) {
    requireRole(Role.OWNER)(req);
    return this.snapshots.restore(boardId, snapshotId);
  }
}
