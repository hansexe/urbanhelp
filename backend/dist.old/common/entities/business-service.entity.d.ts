import { BusinessEntity } from './business.entity';
export declare class BusinessServiceEntity {
    id: string;
    business_id: string;
    service_type: string;
    business_hours_fee: number;
    out_of_hours_fee?: number;
    description?: string;
    out_of_hours_fee: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    business: BusinessEntity;
    get service_name(): string;
    set service_name(v: string);
    get hourly_rate(): number;
    set hourly_rate(v: number);
}
