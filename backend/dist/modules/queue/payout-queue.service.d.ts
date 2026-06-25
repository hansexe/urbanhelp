import { Queue } from 'bull';
export declare class PayoutQueueService {
    private payoutQueue;
    constructor(payoutQueue: Queue);
    queuePayout(businessId: string, amount: number, period: string): Promise<void>;
    queueMonthlyPayouts(): Promise<void>;
    getPendingPayouts(): Promise<any[]>;
}
