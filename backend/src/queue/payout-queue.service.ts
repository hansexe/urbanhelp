import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PayoutQueueService {
  constructor(@InjectQueue('payout') private payoutQueue: Queue) {}

  async queuePayout(
    businessId: string,
    amount: number,
    period: string,
  ): Promise<void> {
    await this.payoutQueue.add(
      {
        businessId,
        amount,
        period,
        processedAt: new Date(),
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );
  }

  async queueMonthlyPayouts(): Promise<void> {
    await this.payoutQueue.add(
      'monthly',
      {},
      {
        jobId: `monthly-payouts-${Date.now()}`,
        repeat: {
          cron: '0 0 1 * *', // First day of month at midnight
          key: 'monthly-payouts',
        },
      },
    );
  }

  async getPendingPayouts(): Promise<any[]> {
    return this.payoutQueue.getJobs(['active', 'waiting']);
  }
}
