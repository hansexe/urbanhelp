import { Job } from 'bull';
import { TwilioService } from '@modules/notifications/twilio.service';
export declare class SmsProcessor {
    private twilioService;
    constructor(twilioService: TwilioService);
    sendSMS(job: Job): Promise<{
        success: boolean;
    }>;
}
