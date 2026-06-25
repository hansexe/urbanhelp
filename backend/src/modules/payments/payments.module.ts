import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripePaymentService } from './stripe-payment.service';
import { StripePayoutService } from './stripe-payout.service';
import { PaymentsController } from './payments.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { ProcessedWebhookEventEntity } from '../../common/entities/processed-webhook-event.entity';
import { CacheModule } from '../../cache/cache.module';
import { CommonModule } from '../../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      BookingEntity,
      BusinessEntity,
      ProcessedWebhookEventEntity,
    ]),
    CacheModule,
    CommonModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [StripePaymentService, StripePayoutService, StripeWebhookService],
  exports: [StripePaymentService, StripePayoutService],
})
export class PaymentsModule {}
