import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  async queueEmail(
    to: string,
    subject: string,
    htmlContent: string,
    options?: any,
  ): Promise<void> {
    await this.emailQueue.add(
      {
        to,
        subject,
        htmlContent,
        ...options,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  async queueSMS(
    phoneNumber: string,
    message: string,
    options?: any,
  ): Promise<void> {
    await this.smsQueue.add(
      {
        phoneNumber,
        message,
        ...options,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  async getBulkEmailJobs(): Promise<any[]> {
    return this.emailQueue.getJobs(['active', 'waiting', 'delayed']);
  }

  async getBulkSmsJobs(): Promise<any[]> {
    return this.smsQueue.getJobs(['active', 'waiting', 'delayed']);
  }
}
