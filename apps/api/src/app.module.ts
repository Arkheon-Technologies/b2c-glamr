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
import { StaffModule } from './modules/staff/staff.module';
import { SearchModule } from './modules/search/search.module';
import { QaModule } from './modules/qa/qa.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FeedModule } from './modules/feed/feed.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { QrModule } from './modules/qr/qr.module';

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
    StaffModule,
    SearchModule,
    QaModule,
    PaymentsModule,
    NotificationsModule,
    GiftCardsModule,
    MessagesModule,
    AnalyticsModule,
    FeedModule,
    MarketingModule,
    WebhooksModule,
    IntegrationsModule,
    QrModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
