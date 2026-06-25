import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { StripePayoutService } from '../../payments/stripe-payout.service';

@Processor('payout')
export class PayoutProcessor {
  constructor(private stripePayoutService: StripePayoutService) {}

  @Process()
  async processPayout(job: Job) {
    if (job.data.type === 'monthly') {
      try {
        await this.stripePayoutService.processMonthlPayouts();
        return { success: true, type: 'monthly' };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new Error(`Monthly payout processing failed: ${err.message}`);
      }
    }

    const { businessId, amount, period } = job.data;

    try {
      // Payout processing logic
      return { success: true, businessId, amount, period };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Payout failed for business ${businessId}: ${err.message}`);
    }
  }
}
