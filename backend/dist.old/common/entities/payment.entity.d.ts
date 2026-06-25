export declare class PaymentEntity {
    id: string;
    booking_id: string;
    customer_id: string;
    business_id: string;
    amount: number;
    commission_amount: number;
    payout_amount: number;
    status: string;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
    stripe_connect_account_id?: string;
    payout_status: string;
    payout_date?: Date;
    failure_reason?: string;
    created_at: Date;
    updated_at: Date;
    completed_at?: Date;
}
