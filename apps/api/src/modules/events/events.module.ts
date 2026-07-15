import { Module, forwardRef } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { BoardMemberGuard } from '../../common/guards/board-member.guard';

@Module({
  imports: [forwardRef(() => SnapshotsModule)],
  controllers: [EventsController],
  providers: [EventsService, BoardMemberGuard],
  exports: [EventsService],
})
export class EventsModule {}
