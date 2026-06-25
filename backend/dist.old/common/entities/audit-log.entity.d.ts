export declare class AuditLogEntity {
    id: string;
    action: string;
    resource?: string;
    details?: any;
    status: string;
    created_at: Date;
}
