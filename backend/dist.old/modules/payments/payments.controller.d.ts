import { StripePaymentService } from './stripe-payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { BookingEntity } from '../../common/entities/booking.entity';
import { Repository } from 'typeorm';
export declare class PaymentsController {
    private readonly stripePaymentService;
    private readonly bookingRepository;
    constructor(stripePaymentService: StripePaymentService, bookingRepository: Repository<BookingEntity>);
    createPaymentIntent(body: CreatePaymentIntentDto): Promise<{
        clientSecret: string | null;
        intentId: string;
        amount: number;
        currency: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
    }>;
}
