import { StripePaymentService } from './stripe-payment.service';
import { CreatePaymentIntentDto } from '../../dtos/payment/payment.dto';
import { BookingEntity } from '../../common/entities/booking.entity';
import { Repository } from 'typeorm';
/**
 * PaymentsController
 * HTTP endpoints for payment operations
 *
 * Security:
 * - All endpoints require JWT authentication
 * - Customer can only pay for their own bookings
 * - Authorization verified via customer ID from JWT token
 */
export declare class PaymentsController {
    private readonly stripePaymentService;
    private readonly bookingRepository;
    constructor(stripePaymentService: StripePaymentService, bookingRepository: Repository<BookingEntity>);
    /**
     * POST /payments/create-intent
     * Create Stripe payment intent for booking
     *
     * Authorization: CUSTOMER role, must own the booking
     * Validation: bookingId must exist and belong to customer
     * Immutable: Cannot change bookingId after intent created
     */
    createPaymentIntent(body: CreatePaymentIntentDto, req: any): Promise<{
        clientSecret: string | null;
        intentId: string;
        amount: number;
        currency: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
    }>;
}
