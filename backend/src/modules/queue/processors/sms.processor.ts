import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TwilioService } from '@modules/notifications/twilio.service';

@Processor('sms')
export class SmsProcessor {
  constructor(private twilioService: TwilioService) {}

  @Process()
  async sendSMS(job: Job) {
    const { phoneNumber, message } = job.data;

    try {
      await this.twilioService.sendSms(phoneNumber, message);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send SMS to ${phoneNumber}: ${errorMessage}`);
    }
  }
}
