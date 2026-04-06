import { Module } from '@nestjs/common';
import { UportfolioController } from './portfolio.controller';
import { UportfolioService } from './portfolio.service';

@Module({
  controllers: [UportfolioController],
  providers: [UportfolioService],
  exports: [UportfolioService],
})
export class UportfolioModule {}
