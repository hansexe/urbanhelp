export declare class CreatePaymentIntentDto {
    booking_id: string;
    amount: number;
    customer_id: string;
}
export declare class ConfirmPaymentDto {
    payment_intent_id: string;
    payment_method_id: string;
}
export declare enum RefundReasonEnum {
    CUSTOMER_REQUEST = "requested_by_customer",
    DUPLICATE = "duplicate",
    FRAUDULENT = "fraudulent",
    SERVICE_NOT_PROVIDED = "service_not_provided",
    QUALITY_ISSUE = "quality_issue"
}
export declare class RefundPaymentDto {
    payment_id: string;
    reason: RefundReasonEnum;
}
