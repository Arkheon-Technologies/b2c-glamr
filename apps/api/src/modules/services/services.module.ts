import { Module } from '@nestjs/common';
import { UservicesController } from './services.controller';
import { UservicesService } from './services.service';

@Module({
  controllers: [UservicesController],
  providers: [UservicesService],
  exports: [UservicesService],
})
export class UservicesModule {}
