export declare class CreateBookingDto {
    business_id: string;
    service_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
    constructor(data: any);
}
export declare class UpdateBookingDto {
    start_time?: string;
    end_time?: string;
    notes?: string;
}
export declare class CancelBookingDto {
    reason: string;
}
