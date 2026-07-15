import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BoardMemberGuard, requireRole } from '../../common/guards/board-member.guard';
import { Role } from '@prisma/client';
import { EventsService } from './events.service';

class AppendEventDto {
  @IsString()
  type!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}

@Controller('boards/:boardId/events')
@UseGuards(JwtAuthGuard, BoardMemberGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Param('boardId') boardId: string, @Query('fromSeq') fromSeq?: string) {
    return this.events.list(boardId, fromSeq ? Number(fromSeq) : 0);
  }

  @Post()
  append(
    @Param('boardId') boardId: string,
    @Req() req: { user: { userId: string }; boardRole: Role },
    @Body() dto: AppendEventDto,
  ) {
    requireRole(Role.OWNER, Role.EDITOR)(req);
    return this.events.append(boardId, req.user.userId, dto.type, dto.payload, dto.clientId, dto.eventId);
  }
}
