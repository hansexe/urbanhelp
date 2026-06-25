import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationQueueService } from './notification-queue.service';
import { PayoutQueueService } from './payout-queue.service';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';
import { PayoutProcessor } from './processors/payout.processor';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    NotificationsModule,
    PaymentsModule,
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'payout' },
    ),
  ],
  providers: [
    NotificationQueueService,
    PayoutQueueService,
    EmailProcessor,
    SmsProcessor,
    PayoutProcessor,
  ],
  exports: [NotificationQueueService, PayoutQueueService],
})
export class QueueModule {}
