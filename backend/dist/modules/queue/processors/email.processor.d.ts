import { Job } from 'bull';
import { SendGridService } from '@modules/notifications/sendgrid.service';
export declare class EmailProcessor {
    private sendGridService;
    constructor(sendGridService: SendGridService);
    sendEmail(job: Job): Promise<{
        success: boolean;
    }>;
}
