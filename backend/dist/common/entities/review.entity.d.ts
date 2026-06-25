import { BusinessEntity } from './business.entity';
import { CustomerEntity } from './customer.entity';
export declare class ReviewEntity {
    id: string;
    booking_id: string;
    customer_id: string;
    business_id: string;
    rating: number;
    title?: string;
    comment?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
    business?: BusinessEntity;
    customer?: CustomerEntity;
}
