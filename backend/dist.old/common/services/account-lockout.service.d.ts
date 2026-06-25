import { RedisService } from './redis.service';
export declare class AccountLockoutService {
    private readonly redisService;
    private readonly prefix;
    private readonly maxAttempts;
    private readonly lockoutSeconds;
    constructor(redisService: RedisService);
    recordFailedAttempt(userId: string): Promise<number>;
    resetAttempts(userId: string): Promise<void>;
    isLocked(userId: string): Promise<boolean>;
}
