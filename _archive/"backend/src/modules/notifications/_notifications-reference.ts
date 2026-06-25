// backend/src/notifications/twilio.service.ts
import { Injectable } from '@nestjs/common';
import twilio from 'twilio';
import { twilioConfig } from '../config/database.config';

@Injectable()
export class TwilioService {
  private client;

  constructor() {
    const config = twilioConfig();
    if (config.accountSid && config.authToken) {
      this.client = twilio(config.accountSid, config.authToken);
    }
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    if (!this.client) {
      console.warn('Twilio not configured, skipping SMS');
      return;
    }

    try {
      const config = twilioConfig();
      await this.client.messages.create({
        body: message,
        from: config.phoneNumber,
        to: phoneNumber,
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    const message = `Your Urban Help verification code is: ${code}. Valid for 10 minutes.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendBookingNotification(phoneNumber: string, businessName: string, appointmentDate: string): Promise<void> {
    const message = `You have a new booking from Urban Help! ${businessName} is available. Appointment: ${appointmentDate}. Please accept or decline within 1 hour.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendBookingConfirmation(phoneNumber: string, businessName: string): Promise<void> {
    const message = `Your booking with ${businessName} has been confirmed! Payment details have been sent to your email. Thank you for using Urban Help.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendPaymentReminder(phoneNumber: string, amount: string): Promise<void> {
    const message = `Please complete payment of $${amount} for your Urban Help booking. Visit: https://urbanhelp.com.au/payment`;
    await this.sendSms(phoneNumber, message);
  }
}

// backend/src/notifications/sendgrid.service.ts
import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { sendgridConfig } from '../config/database.config';
import { OTP_TYPES } from '../constants/app.constants';

@Injectable()
export class SendGridService {
  constructor() {
    const config = sendgridConfig();
    if (config.apiKey) {
      sgMail.setApiKey(config.apiKey);
    }
  }

  async sendOtpEmail(email: string, code: string, type: string): Promise<void> {
    const config = sendgridConfig();

    const subjectMap = {
      [OTP_TYPES.REGISTRATION]: 'Verify your Urban Help account',
      [OTP_TYPES.LOGIN]: 'Your Urban Help login code',
      [OTP_TYPES.PASSWORD_RESET]: 'Reset your Urban Help password',
      [OTP_TYPES.EMAIL_CHANGE]: 'Confirm your new email address',
      [OTP_TYPES.PHONE_CHANGE]: 'Confirm your new phone number',
    };

    const subject = subjectMap[type] || 'Urban Help Verification Code';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verification Code</h2>
        <p>Your Urban Help verification code is:</p>
        <h1 style="color: #FF6B35; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: email,
        from: config.fromEmail,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendBookingConfirmationEmail(
    email: string,
    customerName: string,
    businessName: string,
    appointmentDate: string,
    callOutFee: number,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking with <strong>${businessName}</strong> has been confirmed!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Date:</strong> ${appointmentDate}</p>
          <p><strong>Call-out Fee:</strong> $${callOutFee.toFixed(2)}</p>
        </div>
        <p>Thank you for using Urban Help!</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: email,
        from: config.fromEmail,
        subject: 'Booking Confirmed - Urban Help',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentReceiptEmail(
    email: string,
    customerName: string,
    businessName: string,
    amount: number,
    transactionId: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your payment!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Provider:</strong> ${businessName}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        <p>A receipt has been sent to your email. Keep this for your records.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: email,
        from: config.fromEmail,
        subject: 'Payment Receipt - Urban Help',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send payment receipt email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Urban Help!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for joining Urban Help. We're here to connect you with trusted local tradespeople.</p>
        <p><a href="https://urbanhelp.com.au/search" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find a Professional</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: email,
        from: config.fromEmail,
        subject: 'Welcome to Urban Help',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

// backend/src/payments/stripe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { stripeConfig, appConfig } from '../config/database.config';
import { COMMISSION_PERCENTAGE } from '../constants/app.constants';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private bookingsRepository: Repository<BookingEntity>,
  ) {
    const config = stripeConfig();
    if (config.apiKey) {
      this.stripe = new Stripe(config.apiKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(
    bookingId: string,
    customerId: string,
    businessId: string,
    amount: number,
  ): Promise<any> {
    const config = stripeConfig();

    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const commissionAmount = Math.round(amount * COMMISSION_PERCENTAGE * 100) / 100;
      const payoutAmount = amount - commissionAmount;

      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'aud',
        metadata: {
          bookingId,
          customerId,
          businessId,
        },
        description: `Urban Help booking - ${bookingId}`,
      });

      // Create payment record
      const payment = this.paymentsRepository.create({
        booking_id: bookingId,
        customer_id: customerId,
        business_id: businessId,
        amount,
        commission_amount: commissionAmount,
        payout_amount: payoutAmount,
        stripe_payment_intent_id: intent.id,
        status: 'pending',
      });

      await this.paymentsRepository.save(payment);

      return {
        clientSecret: intent.client_secret,
        amount,
        currency: 'AUD',
        paymentIntentId: intent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<any> {
    try {
      const payment = await this.paymentsRepository.findOne({
        where: { stripe_payment_intent_id: paymentIntentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Update payment status
      payment.status = 'completed';
      payment.completed_at = new Date();
      await this.paymentsRepository.save(payment);

      // Update booking status
      const booking = await this.bookingsRepository.findOne({
        where: { id: payment.booking_id },
      });
      booking.status = 'confirmed';
      await this.bookingsRepository.save(booking);

      // Queue payout to business
      await this.createPayout(payment.business_id, payment.payout_amount, paymentIntentId);

      return {
        success: true,
        paymentId: payment.id,
        bookingId: payment.booking_id,
      };
    } catch (error) {
      console.error('Payment success handling failed:', error);
      throw error;
    }
  }

  async handlePaymentFailure(paymentIntentId: string, errorMessage: string): Promise<any> {
    const payment = await this.paymentsRepository.findOne({
      where: { stripe_payment_intent_id: paymentIntentId },
    });

    if (payment) {
      payment.status = 'failed';
      payment.failure_reason = errorMessage;
      await this.paymentsRepository.save(payment);
    }

    return { success: false, message: 'Payment failed' };
  }

  async getStripeConnectAccount(businessEmail: string): Promise<any> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const accounts = await this.stripe.accounts.list({
        limit: 1,
      });

      if (accounts.data.length === 0) {
        // Create new connected account
        const account = await this.stripe.accounts.create({
          type: 'express',
          country: 'AU',
          email: businessEmail,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

        return { accountId: account.id, isNew: true };
      }

      return { accountId: accounts.data[0].id, isNew: false };
    } catch (error) {
      console.error('Failed to get Stripe Connect account:', error);
      throw new BadRequestException('Failed to setup payment account');
    }
  }

  private async createPayout(businessId: string, amount: number, referenceId: string): Promise<void> {
    // This would be implemented with a job queue (Bull) in production
    // For now, just log it
    console.log(`Payout queued: Business ${businessId}, Amount $${amount}, Reference ${referenceId}`);
  }

  async verifyWebhookSignature(body: any, signature: string): Promise<any> {
    const config = stripeConfig();

    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(body, signature, config.webhookSecret);
    } catch (error) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}

// backend/src/payments/stripe.controller.ts
import { Controller, Post, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('webhooks/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const body = req.rawBody || req.body;

    const event = await this.stripeService.verifyWebhookSignature(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.stripeService.handlePaymentSuccess(event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        await this.stripeService.handlePaymentFailure(
          event.data.object.id,
          event.data.object.last_payment_error?.message || 'Unknown error',
        );
        break;
    }

    return { received: true };
  }
}

// backend/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, BookingEntity])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
