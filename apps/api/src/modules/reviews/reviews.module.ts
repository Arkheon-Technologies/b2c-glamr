import { Module } from '@nestjs/common';
import { UreviewsController } from './reviews.controller';
import { UreviewsService } from './reviews.service';

@Module({
  controllers: [UreviewsController],
  providers: [UreviewsService],
  exports: [UreviewsService],
})
export class UreviewsModule {}
