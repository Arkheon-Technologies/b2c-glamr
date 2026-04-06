import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessModule } from './modules/business/business.module';
import { ServicesModule } from './modules/services/services.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { BookingModule } from './modules/booking/booking.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { QueueModule } from './modules/queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BusinessModule,
    ServicesModule,
    SchedulingModule,
    BookingModule,
    PortfolioModule,
    ReviewsModule,
    QueueModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
