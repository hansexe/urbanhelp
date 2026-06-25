import { Job } from 'bull';
import { StripePayoutService } from '@modules/payments/stripe-payout.service';
export declare class PayoutProcessor {
    private stripePayoutService;
    constructor(stripePayoutService: StripePayoutService);
    processPayout(job: Job): Promise<{
        success: boolean;
        type: string;
        businessId?: undefined;
        amount?: undefined;
        period?: undefined;
    } | {
        success: boolean;
        businessId: any;
        amount: any;
        period: any;
        type?: undefined;
    }>;
}
