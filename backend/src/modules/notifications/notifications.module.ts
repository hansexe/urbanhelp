import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendGridService } from './sendgrid.service';
import { TwilioService } from './twilio.service';

@Module({
  imports: [ConfigModule],
  providers: [SendGridService, TwilioService],
  exports: [SendGridService, TwilioService],
})
export class NotificationsModule {}
