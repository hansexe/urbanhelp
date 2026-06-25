import { BusinessEntity } from './business.entity';
export declare class BusinessHoursEntity {
    id: string;
    business_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
    business: BusinessEntity;
    get open_time(): string;
    set open_time(v: string);
    get close_time(): string;
    set close_time(v: string);
}
