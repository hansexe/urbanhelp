import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { BusinessEntity } from '../../common/entities/business.entity';
import { stripeConfig } from '../../config/config';

@Injectable()
export class StripePayoutService {
  private readonly logger = new Logger(StripePayoutService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
  ) {
    const config = stripeConfig();
    this.stripe = new Stripe(config.secretKey || '', undefined as any);
  }

  async processMonthlPayouts(): Promise<void> {
    try {
      this.logger.log('Processing monthly payouts...');
      // Payout processing logic
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Monthly payout processing failed: ${errorMsg}`);
      throw error;
    }
  }
}
