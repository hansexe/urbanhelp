import { Repository } from 'typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import { RedisService } from '@common/services/redis.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
export interface LockoutConfig {
    maxAttempts: number;
    lockoutDurationMinutes: number;
    resetAfterDays: number;
}
export declare class AccountLockoutService {
    private userRepository;
    private redisService;
    private sendGridService;
    private twilioService;
    private readonly config;
    constructor(userRepository: Repository<UserEntity>, redisService: RedisService, sendGridService: SendGridService, twilioService: TwilioService);
    recordFailedLogin(email: string): Promise<void>;
    recordSuccessfulLogin(email: string): Promise<void>;
    lockAccount(email: string): Promise<void>;
    unlockAccount(email: string): Promise<void>;
    isAccountLocked(email: string): Promise<boolean>;
    getFailedAttempts(email: string): Promise<number>;
    getRemainingAttempts(email: string): Promise<number>;
    getLockoutTimeRemaining(email: string): Promise<number>;
}
