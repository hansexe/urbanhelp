import { IsString, IsUUID, IsNumber, IsOptional, IsPositive, Min, Max, IsNotEmpty } from 'class-validator';

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
export class CreatePaymentIntentDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @IsString()
  @IsOptional()
  stripeCustomerId?: string;
}

/**
 * ProcessPaymentDto
 * Validated request to process a payment (internal use)
 */
export class ProcessPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @IsNumber()
  @IsPositive()
  @Min(50) // Minimum $0.50 AUD
  @Max(999999) // Maximum $9999.99 AUD
  amountCents!: number;

  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsOptional()
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
export class RefundPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string; // "customer_request", "booking_cancelled", "service_dispute", etc.
}

/**
 * ProcessPayoutDto
 * Validated request to process business payout
 *
 * Authorization: ADMIN role only
 */
export class ProcessPayoutDto {
  @IsUUID()
  @IsNotEmpty()
  businessId!: string;
}

/**
 * GetPaymentDto
 * Validated request to retrieve payment details
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
export class GetPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId!: string;
}

/**
 * ListPaymentsDto
 * Validated request to list customer payments
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
export class ListPaymentsDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsOptional()
  @IsString()
  status?: 'succeeded' | 'failed' | 'processing' | 'refunded';
}

/**
 * ListPayoutsDto
 * Validated request to list business payouts
 *
 * Authorization: BUSINESS (own payouts) or ADMIN
 */
export class ListPayoutsDto {
  @IsUUID()
  @IsNotEmpty()
  businessId!: string;
}
