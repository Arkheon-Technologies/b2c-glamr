import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ListQueueDto } from './dto/list-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  async list(@Query() query: ListQueueDto) {
    return this.queueService.listQueue(query);
  }

  @Post('join')
  async join(@Body() body: JoinQueueDto) {
    return this.queueService.joinQueue(body);
  }

  @Post(':entryId/status')
  async updateStatus(
    @Param('entryId') entryId: string,
    @Body() body: UpdateQueueStatusDto,
  ) {
    return this.queueService.updateStatus(entryId, body.status);
  }
}
