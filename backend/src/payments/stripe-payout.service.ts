import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import Stripe from 'stripe';
import { BusinessEntity } from '../entities/business.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { stripeConfig } from '../config/config';

export interface PayoutDetails {
  bankAccountId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  bsb: string;
  verified: boolean;
}

export interface MonthlyPayout {
  businessId: string;
  period: string;
  totalBookings: number;
  totalRevenue: number;
  commission: number;
  payoutAmount: number;
  payoutDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
}

@Injectable()
export class StripePayoutService {
  private stripe: Stripe;
  private readonly commissionRate = 0.1; // 10%

  constructor(
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private sendGridService: SendGridService,
  ) {
    const config = stripeConfig();
    this.stripe = new Stripe(config.secretKey || '', undefined as any);
  }

  async setupConnectAccount(
    businessId: string,
    email: string,
    businessName: string,
  ): Promise<string> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business) {
        throw new NotFoundException('Business not found');
      }

      // Create Stripe Connect account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'AU',
        email,
        business_profile: {
          name: businessName,
          support_phone: '+61-0-0-0-0-0-0',
          support_email: email,
          url: 'https://urbanhelp.com.au',
        } as any,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          au_becs_debit_payments: { requested: true },
        },
      } as any);

      // Save Stripe account ID
      business.stripe_connect_account_id = account.id;
      await this.businessRepository.save(business);

      return account.id;
    } catch (error) {
      console.error('Stripe Connect setup error:', error);
      throw new BadRequestException('Failed to setup Stripe Connect account');
    }
  }

  async createAccountLink(businessId: string): Promise<string> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business || !business.stripe_connect_account_id) {
        throw new NotFoundException('Stripe account not found');
      }

      const accountLink = await this.stripe.accountLinks.create({
        account: business.stripe_connect_account_id,
        type: 'account_onboarding',
        refresh_url: 'https://urbanhelp.com.au/business/stripe-refresh',
        return_url: 'https://urbanhelp.com.au/business/stripe-success',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Account link creation error:', error);
      throw new BadRequestException('Failed to create account link');
    }
  }

  async transferFundsToConnectedAccount(
    paymentId: string,
    businessId: string,
  ): Promise<string> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business || !business.stripe_connect_account_id) {
        throw new BadRequestException('Business Stripe account not set up');
      }

      // Calculate business amount (90% of total)
      const businessAmount = Math.round(payment.amount * 90 * 10); // in cents

      const transfer = await this.stripe.transfers.create({
        amount: businessAmount,
        currency: 'aud',
        destination: business.stripe_connect_account_id,
        transfer_group: `booking_${paymentId}`,
        metadata: {
          paymentId,
          businessId,
          bookingId: payment.booking_id,
        },
      });

      // Update payment with transfer ID
      payment.transfer_id = transfer.id;
      await this.paymentRepository.save(payment);

      return transfer.id;
    } catch (error) {
      console.error('Transfer error:', error);
      throw new BadRequestException('Failed to transfer funds');
    }
  }

  async calculateMonthlyPayout(businessId: string, year: number, month: number): Promise<MonthlyPayout> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const payments = await this.paymentRepository.find({
      where: {
        business_id: businessId,
        payment_type: 'booking',
        status: 'succeeded',
        created_at: Between(startDate, endDate),
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const commission = Math.round(totalRevenue * this.commissionRate * 100) / 100;
    const payoutAmount = totalRevenue - commission;

    return {
      businessId,
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalBookings: payments.length,
      totalRevenue,
      commission,
      payoutAmount,
      payoutDate: new Date(year, month, 1),
      status: 'pending',
    };
  }

  async processMonthlPayouts(): Promise<void> {
    // Find all connected businesses
    const businesses = await this.businessRepository.find({
      where: {
        stripe_connect_account_id: '!= NULL',
        approval_status: 'approved',
      },
    });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    for (const business of businesses) {
      try {
        const payout = await this.calculateMonthlyPayout(business.id, year, month);

        if (payout.payoutAmount > 0) {
          // Initiate payout via Stripe
          const payoutResponse = await this.stripe.payouts.create(
            {
              amount: Math.round(payout.payoutAmount * 100), // in cents
              currency: 'aud',
              method: 'instant',
              metadata: {
                businessId: business.id,
                period: payout.period,
              },
            },
            {
              stripeAccount: business.stripe_connect_account_id,
            },
          );

          // Send payout confirmation email
          await this.sendGridService.sendPayoutProcessedEmail(
            business.user.email,
            business.name,
            payout.payoutAmount,
          );
        }
      } catch (error) {
        console.error(`Payout processing error for business ${business.id}:`, error);
      }
    }
  }

  async getPayoutHistory(businessId: string): Promise<any[]> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business || !business.stripe_connect_account_id) {
        return [];
      }

      const payouts = await this.stripe.payouts.list(
        { limit: 12 },
        { stripeAccount: business.stripe_connect_account_id },
      );

      return payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount / 100, // convert from cents
        currency: payout.currency,
        status: payout.status,
        arrivalDate: new Date(payout.arrival_date * 1000),
        createdDate: new Date(payout.created * 1000),
      }));
    } catch (error) {
      console.error('Payout history error:', error);
      return [];
    }
  }

  async verifyBankingDetails(
    businessId: string,
    bsb: string,
    accountNumber: string,
  ): Promise<boolean> {
    try {
      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business || !business.stripe_connect_account_id) {
        throw new BadRequestException('Business not found');
      }

      // Verify with Stripe
      const bankAccount = await this.stripe.accounts.createExternalAccount(
        business.stripe_connect_account_id,
        {
          external_account: {
            object: 'bank_account',
            country: 'AU',
            currency: 'aud',
            account_number: accountNumber,
            routing_number: bsb,
            account_holder_name: business.name,
          },
        } as any,
      );

      // Mark banking details as verified
      if (business.banking_details && business.banking_details.length > 0) {
        business.banking_details[0].is_verified = true;
      }
      await this.businessRepository.save(business);

      return true;
    } catch (error) {
      console.error('Bank verification error:', error);
      return false;
    }
  }
}
