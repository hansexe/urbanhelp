export declare class OtpCodeEntity {
    id: string;
    user_id: string;
    code: string;
    type: string;
    is_used: boolean;
    expires_at: Date;
    created_at: Date;
}
