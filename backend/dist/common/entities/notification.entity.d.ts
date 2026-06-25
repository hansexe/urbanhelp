export declare class NotificationEntity {
    id: string;
    recipient_id: string;
    type: string;
    subject?: string;
    content: string;
    status: string;
    sent_at?: Date;
    opened_at?: Date;
    external_id?: string;
    failure_reason?: string;
    created_at: Date;
    updated_at: Date;
}
