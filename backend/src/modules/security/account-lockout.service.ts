import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import { RedisService } from '@common/services/redis.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';

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
    const ttl = await this.redisService.getTTL(lockoutKey);
    return ttl > 0 ? ttl : 0;
  }
}
