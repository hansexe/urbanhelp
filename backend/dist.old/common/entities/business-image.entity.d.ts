import { BusinessEntity } from './business.entity';
export declare class BusinessImageEntity {
    id: string;
    business_id: string;
    image_url: string;
    s3_key: string;
    display_order: number;
    is_primary: boolean;
    created_at: Date;
    business: BusinessEntity;
}
