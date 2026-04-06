import { Module } from '@nestjs/common';
import { UbookingController } from './booking.controller';
import { UbookingService } from './booking.service';

@Module({
  controllers: [UbookingController],
  providers: [UbookingService],
  exports: [UbookingService],
})
export class UbookingModule {}
