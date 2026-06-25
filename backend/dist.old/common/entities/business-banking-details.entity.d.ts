import { BusinessEntity } from './business.entity';
export declare class BusinessBankingDetailsEntity {
    id: string;
    business_id: string;
    account_name: string;
    bsb: string;
    account_number: string;
    stripe_connect_account_id?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
    business: BusinessEntity;
}
