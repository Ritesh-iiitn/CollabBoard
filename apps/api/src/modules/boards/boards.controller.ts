import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../../common/guards/board-member.guard';
import { BoardsService } from './boards.service';

class CreateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;
}

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  @Get()
  list(@Req() req: { user: { userId: string } }) {
    return this.boards.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: { user: { userId: string } }, @Body() dto: CreateBoardDto) {
    return this.boards.create(req.user.userId, dto.title);
  }

  @Get(':boardId')
  @UseGuards(BoardMemberGuard)
  get(@Param('boardId') boardId: string) {
    return this.boards.get(boardId);
  }
}
