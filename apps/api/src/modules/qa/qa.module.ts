import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QaController],
  providers: [QaService],
})
export class QaModule {}
