import { Queue } from 'bull';
export declare class NotificationQueueService {
    private emailQueue;
    private smsQueue;
    constructor(emailQueue: Queue, smsQueue: Queue);
    queueEmail(to: string, subject: string, htmlContent: string, options?: any): Promise<void>;
    queueSMS(phoneNumber: string, message: string, options?: any): Promise<void>;
    getBulkEmailJobs(): Promise<any[]>;
    getBulkSmsJobs(): Promise<any[]>;
}
