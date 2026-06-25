import { Repository } from 'typeorm';
import { BusinessEntity } from '../entities/business.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
export interface PayoutDetails {
    bankAccountId: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    bsb: string;
    verified: boolean;
}
export interface MonthlyPayout {
    businessId: string;
    period: string;
    totalBookings: number;
    totalRevenue: number;
    commission: number;
    payoutAmount: number;
    payoutDate: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
}
export declare class StripePayoutService {
    private businessRepository;
    private paymentRepository;
    private sendGridService;
    private stripe;
    private readonly commissionRate;
    constructor(businessRepository: Repository<BusinessEntity>, paymentRepository: Repository<PaymentEntity>, sendGridService: SendGridService);
    setupConnectAccount(businessId: string, email: string, businessName: string): Promise<string>;
    createAccountLink(businessId: string): Promise<string>;
    transferFundsToConnectedAccount(paymentId: string, businessId: string): Promise<string>;
    calculateMonthlyPayout(businessId: string, year: number, month: number): Promise<MonthlyPayout>;
    processMonthlPayouts(): Promise<void>;
    getPayoutHistory(businessId: string): Promise<any[]>;
    verifyBankingDetails(businessId: string, bsb: string, accountNumber: string): Promise<boolean>;
}
