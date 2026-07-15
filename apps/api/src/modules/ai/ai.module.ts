import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BoardMemberGuard } from '../../common/guards/board-member.guard';

@Module({
  controllers: [AiController],
  providers: [AiService, BoardMemberGuard],
})
export class AiModule {}
