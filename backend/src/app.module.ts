import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HealthModule } from './modules/health/health.module';

// Database configuration
import AppDataSource from './database';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CustomersModule } from './modules/customers/customers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { LocationModule } from './modules/location/location.module';
import { AdminModule } from './modules/admin/admin.module';
import { BusinessDashboardModule } from './modules/business-dashboard/business-dashboard.module';
import { CustomerDashboardModule } from './modules/customer-dashboard/customer-dashboard.module';
import { CacheModule } from './modules/cache/cache.module';
import { QueueModule } from './modules/queue/queue.module';
import { SecurityModule } from './modules/security/security.module';

// Common Module
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [
      `.env.${process.env.NODE_ENV || 'development'}`,
      '.env',
    ],
  }),

    // Database - Using TypeORM DataSource configured in src/database.ts
    TypeOrmModule.forRoot(AppDataSource.options),

    // Redis Cache
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Task Queue (Bull)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Queue registrations are handled in the canonical QueueModule

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    BusinessesModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    CustomersModule,
    NotificationsModule,
    SearchModule,
    UploadsModule,
    LocationModule,
    AdminModule,
    BusinessDashboardModule,
    CustomerDashboardModule,
    CacheModule,
    QueueModule,
    SecurityModule,
    HealthModule,
    // Common Module
    CommonModule,
  ],
})
export class AppModule {}
