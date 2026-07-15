import { Module } from '@nestjs/common';
import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';
import { BoardMemberGuard } from '../../common/guards/board-member.guard';

@Module({
  controllers: [SnapshotsController],
  providers: [SnapshotsService, BoardMemberGuard],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
