import { Module } from '@nestjs/common';
import { UqueueController } from './queue.controller';
import { UqueueService } from './queue.service';

@Module({
  controllers: [UqueueController],
  providers: [UqueueService],
  exports: [UqueueService],
})
export class UqueueModule {}
