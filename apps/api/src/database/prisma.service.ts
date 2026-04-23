import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Attempt to connect but do NOT crash the app if the DB is temporarily unreachable.
    // Prisma will reconnect lazily on the first query. This allows the app to start
    // and serve health-check / static routes even when the DB is warming up.
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (err: any) {
      this.logger.warn(
        `Database connection failed on startup (will retry on first query): ${err?.message ?? err}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
