import { Module } from '@nestjs/common';
import { UschedulingController } from './scheduling.controller';
import { UschedulingService } from './scheduling.service';

@Module({
  controllers: [UschedulingController],
  providers: [UschedulingService],
  exports: [UschedulingService],
})
export class UschedulingModule {}
