import { IsNotEmpty, IsUUID, IsNumber, Min, Max, IsEnum } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsUUID()
  booking_id!: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(50, { message: 'Minimum amount is $0.50 AUD (50 cents)' })
  @Max(999999, { message: 'Maximum amount is $9999.99 AUD' })
  amount!: number; // In cents

  @IsNotEmpty()
  @IsUUID()
  customer_id!: string;
}

export class ConfirmPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  payment_intent_id!: string;

  @IsNotEmpty()
  @IsUUID()
  payment_method_id!: string;
}

export enum RefundReasonEnum {
  CUSTOMER_REQUEST = 'requested_by_customer',
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  QUALITY_ISSUE = 'quality_issue',
}

export class RefundPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  payment_id!: string;

  @IsEnum(RefundReasonEnum, { message: 'Invalid refund reason' })
  reason!: RefundReasonEnum;
}
