// backend/src/security/rate-limit.middleware.ts
import { Injectable, NestMiddleware, TooManyRequestsException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../cache/redis.service';

interface RateLimitConfig {
  windowMs: number; // time window in milliseconds
  maxRequests: number; // max requests per window
  message?: string;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private redisService: RedisService) {}

  private configs: Map<string, RateLimitConfig> = new Map([
    ['auth', { windowMs: 15 * 60 * 1000, maxRequests: 5 }], // 5 attempts per 15 min
    ['api', { windowMs: 60 * 1000, maxRequests: 100 }], // 100 requests per minute
    ['search', { windowMs: 60 * 1000, maxRequests: 30 }], // 30 searches per minute
    ['upload', { windowMs: 60 * 1000, maxRequests: 10 }], // 10 uploads per minute
  ]);

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const endpoint = this.getEndpointCategory(req.path);
      const config = this.configs.get(endpoint) || this.configs.get('api');

      const clientIp = req.ip || 'unknown';
      const key = `ratelimit:${endpoint}:${clientIp}`;

      const current = await this.redisService.increment(key);

      if (current === 1) {
        // First request in window, set expiry
        await this.redisService.setWithExpiry(key, '1', Math.ceil(config!.windowMs / 1000));
      }

      if (current > config!.maxRequests) {
        throw new TooManyRequestsException(
          config!.message || `Rate limit exceeded for ${endpoint}`,
        );
      }

      res.setHeader('X-RateLimit-Limit', config!.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config!.maxRequests - current);
      res.setHeader('X-RateLimit-Reset', Date.now() + config!.windowMs);

      next();
    } catch (error) {
      if (error instanceof TooManyRequestsException) {
        throw error;
      }
      // If Redis is down, allow request to proceed
      next();
    }
  }

  private getEndpointCategory(path: string): string {
    if (path.includes('/auth')) return 'auth';
    if (path.includes('/search')) return 'search';
    if (path.includes('/uploads')) return 'upload';
    return 'api';
  }
}

// backend/src/security/account-lockout.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RedisService } from '../cache/redis.service';
import { SendGridService } from '../notifications/sendgrid.service';
import { TwilioService } from '../notifications/twilio.service';

export interface LockoutConfig {
  maxAttempts: number; // max failed login attempts
  lockoutDurationMinutes: number; // duration of lockout
  resetAfterDays: number; // reset counter after this many days
}

@Injectable()
export class AccountLockoutService {
  private readonly config: LockoutConfig = {
    maxAttempts: 5,
    lockoutDurationMinutes: 30,
    resetAfterDays: 7,
  };

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private redisService: RedisService,
    private sendGridService: SendGridService,
    private twilioService: TwilioService,
  ) {}

  async recordFailedLogin(email: string): Promise<void> {
    const failedKey = `failed_login:${email}`;
    const lockoutKey = `lockout:${email}`;

    // Check if already locked
    const isLocked = await this.redisService.exists(lockoutKey);
    if (isLocked) {
      throw new BadRequestException('Account temporarily locked. Try again later.');
    }

    // Increment failed attempts
    const attempts = await this.redisService.increment(failedKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await this.redisService.setWithExpiry(
        failedKey,
        '1',
        this.config.resetAfterDays * 24 * 60 * 60,
      );
    }

    // Lock account if max attempts exceeded
    if (attempts >= this.config.maxAttempts) {
      await this.lockAccount(email);
      throw new BadRequestException('Account locked due to too many failed attempts');
    }
  }

  async recordSuccessfulLogin(email: string): Promise<void> {
    const failedKey = `failed_login:${email}`;
    await this.redisService.del(failedKey);
  }

  async lockAccount(email: string): Promise<void> {
    const lockoutKey = `lockout:${email}`;

    // Set lockout in Redis
    await this.redisService.setWithExpiry(
      lockoutKey,
      'locked',
      this.config.lockoutDurationMinutes * 60,
    );

    // Get user and send notifications
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      try {
        await this.sendGridService.sendAccountLockedEmail(email, user.first_name);
        if (user.phone_number) {
          await this.twilioService.sendAccountLockedSMS(user.phone_number);
        }
      } catch (error) {
        console.error('Failed to send lockout notification:', error);
      }
    }
  }

  async unlockAccount(email: string): Promise<void> {
    const lockoutKey = `lockout:${email}`;
    const failedKey = `failed_login:${email}`;

    await this.redisService.del(lockoutKey);
    await this.redisService.del(failedKey);
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const lockoutKey = `lockout:${email}`;
    return (await this.redisService.exists(lockoutKey)) > 0;
  }

  async getFailedAttempts(email: string): Promise<number> {
    const failedKey = `failed_login:${email}`;
    const attempts = await this.redisService.get(failedKey);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  async getRemainingAttempts(email: string): Promise<number> {
    const attempts = await this.getFailedAttempts(email);
    return Math.max(0, this.config.maxAttempts - attempts);
  }

  async getLockoutTimeRemaining(email: string): Promise<number> {
    const lockoutKey = `lockout:${email}`;
    const ttl = await this.redisService.client.ttl(lockoutKey);
    return ttl > 0 ? ttl : 0;
  }
}

// backend/src/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationQueueService } from './notification-queue.service';
import { PayoutQueueService } from './payout-queue.service';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';
import { PayoutProcessor } from './processors/payout.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'payout' },
    ),
  ],
  providers: [
    NotificationQueueService,
    PayoutQueueService,
    EmailProcessor,
    SmsProcessor,
    PayoutProcessor,
  ],
  exports: [NotificationQueueService, PayoutQueueService],
})
export class QueueModule {}

// backend/src/queue/notification-queue.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  async queueEmail(
    to: string,
    subject: string,
    htmlContent: string,
    options?: any,
  ): Promise<void> {
    await this.emailQueue.add(
      {
        to,
        subject,
        htmlContent,
        ...options,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  async queueSMS(
    phoneNumber: string,
    message: string,
    options?: any,
  ): Promise<void> {
    await this.smsQueue.add(
      {
        phoneNumber,
        message,
        ...options,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }

  async getBulkEmailJobs(): Promise<any[]> {
    return this.emailQueue.getJobs(['active', 'waiting', 'delayed']);
  }

  async getBulkSmsJobs(): Promise<any[]> {
    return this.smsQueue.getJobs(['active', 'waiting', 'delayed']);
  }
}

// backend/src/queue/payout-queue.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PayoutQueueService {
  constructor(@InjectQueue('payout') private payoutQueue: Queue) {}

  async queuePayout(
    businessId: string,
    amount: number,
    period: string,
  ): Promise<void> {
    await this.payoutQueue.add(
      {
        businessId,
        amount,
        period,
        processedAt: new Date(),
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );
  }

  async queueMonthlyPayouts(): Promise<void> {
    await this.payoutQueue.add(
      { type: 'monthly' },
      {
        jobId: `monthly-payouts-${Date.now()}`,
        repeat: {
          cron: '0 0 1 * *', // First day of month at midnight
        },
      },
    );
  }

  async getPendingPayouts(): Promise<any[]> {
    return this.payoutQueue.getJobs(['active', 'waiting']);
  }
}

// backend/src/queue/processors/email.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SendGridService } from '../../notifications/sendgrid.service';

@Processor('email')
export class EmailProcessor {
  constructor(private sendGridService: SendGridService) {}

  @Process()
  async sendEmail(job: Job) {
    const { to, subject, htmlContent } = job.data;

    try {
      await this.sendGridService.sendEmail(to, subject, htmlContent);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}

// backend/src/queue/processors/sms.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TwilioService } from '../../notifications/twilio.service';

@Processor('sms')
export class SmsProcessor {
  constructor(private twilioService: TwilioService) {}

  @Process()
  async sendSMS(job: Job) {
    const { phoneNumber, message } = job.data;

    try {
      await this.twilioService.sendSms(phoneNumber, message);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to send SMS to ${phoneNumber}: ${error.message}`);
    }
  }
}

// backend/src/queue/processors/payout.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { StripePayoutService } from '../../payments/stripe-payout.service';

@Processor('payout')
export class PayoutProcessor {
  constructor(private stripePayoutService: StripePayoutService) {}

  @Process()
  async processPayout(job: Job) {
    if (job.data.type === 'monthly') {
      try {
        await this.stripePayoutService.processMonthlPayouts();
        return { success: true, type: 'monthly' };
      } catch (error) {
        throw new Error(`Monthly payout processing failed: ${error.message}`);
      }
    }

    const { businessId, amount, period } = job.data;

    try {
      // Payout processing logic
      return { success: true, businessId, amount, period };
    } catch (error) {
      throw new Error(`Payout failed for business ${businessId}: ${error.message}`);
    }
  }
}

// Add to notifications/sendgrid.service.ts
async sendAccountLockedEmail(email: string, firstName: string): Promise<void> {
  const config = sendgridConfig();
  const unlockLink = 'https://urbanhelp.com.au/auth/unlock-account';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Temporarily Locked</h2>
      <p>Hi ${firstName},</p>
      <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
      <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>For security reasons, your account will be automatically unlocked in 30 minutes.</p>
        <p>If you did not attempt to log in, you can unlock your account immediately:</p>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${unlockLink}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Unlock Account</a>
      </p>
      <p>Best regards,<br>Urban Help Team</p>
    </div>
  `;

  await sgMail.send({
    to: email,
    from: config.fromEmail,
    subject: 'Account Temporarily Locked',
    html: htmlContent,
  });
}

// Add to notifications/twilio.service.ts
async sendAccountLockedSMS(phoneNumber: string): Promise<void> {
  const message = 'Urban Help: Your account has been locked for security. It will unlock in 30 minutes.';
  await this.sendSms(phoneNumber, message);
}
