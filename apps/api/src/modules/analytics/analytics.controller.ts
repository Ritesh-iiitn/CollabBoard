import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  ingest(@Body() body: { events: { name: string; userId?: string; boardId?: string; properties?: Record<string, unknown> }[] }) {
    return this.analytics.ingest(body.events ?? []);
  }

  @Get('dashboard')
  dashboard() {
    return this.analytics.dashboard();
  }
}
