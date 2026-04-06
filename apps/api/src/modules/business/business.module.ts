import { Module } from '@nestjs/common';
import { UbusinessController } from './business.controller';
import { UbusinessService } from './business.service';

@Module({
  controllers: [UbusinessController],
  providers: [UbusinessService],
  exports: [UbusinessService],
})
export class UbusinessModule {}
