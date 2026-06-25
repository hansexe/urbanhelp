import { Controller, Post, Body, BadRequestException, UseGuards, ForbiddenException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StripePaymentService } from './stripe-payment.service';
import { CreatePaymentIntentDto } from '../../dtos/payment/payment.dto';
import { BookingEntity } from '../../common/entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
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
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly stripePaymentService: StripePaymentService,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  /**
   * POST /payments/create-intent
   * Create Stripe payment intent for booking
   *
   * Authorization: CUSTOMER role, must own the booking
   * Validation: bookingId must exist and belong to customer
   * Immutable: Cannot change bookingId after intent created
   */
  @Post('create-intent')
  async createPaymentIntent(
    @Body() body: CreatePaymentIntentDto,
    @Req() req: any,
  ) {
    const { bookingId, stripeCustomerId } = body;
    const customerId = req.user.id;

    if (!bookingId) {
      throw new BadRequestException('bookingId is required');
    }

    // Fetch booking with customer verification
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer'],
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // AUTHORIZATION: Customer can only pay for their own bookings
    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('You do not have permission to pay for this booking');
    }

    // VALIDATION: Booking must be in payable state (not already completed/cancelled)
    const payableStates = ['confirmed', 'in_progress'];
    if (!payableStates.includes(booking.status)) {
      throw new BadRequestException(`Cannot pay for booking with status: ${booking.status}`);
    }

    // VALIDATION: Cannot pay twice
    if (booking.status === 'confirmed' && booking.confirmed_at) {
      throw new BadRequestException('This booking has already been paid');
    }

    // Compute amount in cents. Use call_out_fee + commission if present.
    const callOut = Number(booking.call_out_fee || 0);
    const commission = Number(booking.commission_amount || 0);
    const amountCents = Math.round((callOut + commission) * 100);

    // VALIDATION: Amount must be positive and reasonable
    if (amountCents <= 0) {
      throw new BadRequestException('Booking amount must be greater than zero');
    }

    const intent = await this.stripePaymentService.createPaymentIntent(
      bookingId,
      amountCents,
      stripeCustomerId,
    );

    return {
      clientSecret: intent.client_secret,
      intentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
    };
  }
}
