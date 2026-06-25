export class CreatePaymentIntentDto {
  bookingId: string;
  // Optional Stripe Customer ID if already created for the user
  stripeCustomerId?: string;
}
