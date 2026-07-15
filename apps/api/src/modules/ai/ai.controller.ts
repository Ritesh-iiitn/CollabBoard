import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../../common/guards/board-member.guard';
import { AiService } from './ai.service';

class SummaryDto {
  @IsString()
  boardText!: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
}

class DiagramDto {
  @IsString()
  prompt!: string;
}

@Controller('boards/:boardId/ai')
@UseGuards(JwtAuthGuard, BoardMemberGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('meeting-summary')
  summary(@Param('boardId') boardId: string, @Body() dto: SummaryDto) {
    return this.ai.meetingSummary(boardId, dto.boardText, dto.imageBase64);
  }

  @Post('action-items')
  actionItems(@Param('boardId') boardId: string, @Body() dto: SummaryDto) {
    return this.ai.actionItems(boardId, dto.boardText);
  }

  @Post('diagram')
  diagram(@Body() dto: DiagramDto) {
    return this.ai.generateDiagram(dto.prompt);
  }
}
