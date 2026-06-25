/**
 * CreatePaymentIntentDto
 * Validated request to create payment intent for booking
 *
 * Validation:
 * - bookingId: UUID for booking (must exist and belong to customer)
 * - stripeCustomerId: optional Stripe customer ID
 *
 * Authorization: CUSTOMER role, booking owner only
 */
export declare class CreatePaymentIntentDto {
    bookingId: string;
    stripeCustomerId?: string;
}
/**
 * ProcessPaymentDto
 * Validated request to process a payment (internal use)
 */
export declare class ProcessPaymentDto {
    bookingId: string;
    amountCents: number;
    customerId: string;
    stripeCustomerId?: string;
}
/**
 * RefundPaymentDto
 * Validated request to refund a payment
 *
 * Immutable Fields:
 * - paymentId: cannot change which payment to refund
 * - amount: refund amount fixed at time of cancellation
 *
 * Mutable Fields:
 * - reason: reason for refund (audit trail)
 *
 * Authorization: ADMIN role or CUSTOMER role (own booking)
 */
export declare class RefundPaymentDto {
    paymentId: string;
    reason: string;
}
/**
 * ProcessPayoutDto
 * Validated request to process business payout
 *
 * Authorization: ADMIN role only
 */
export declare class ProcessPayoutDto {
    businessId: string;
}
/**
 * GetPaymentDto
 * Validated request to retrieve payment details
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
export declare class GetPaymentDto {
    paymentId: string;
}
/**
 * ListPaymentsDto
 * Validated request to list customer payments
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
export declare class ListPaymentsDto {
    customerId: string;
    status?: 'succeeded' | 'failed' | 'processing' | 'refunded';
}
/**
 * ListPayoutsDto
 * Validated request to list business payouts
 *
 * Authorization: BUSINESS (own payouts) or ADMIN
 */
export declare class ListPayoutsDto {
    businessId: string;
}
