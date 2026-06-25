import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../cache/redis.service';
export declare class RateLimitMiddleware implements NestMiddleware {
    private redisService;
    constructor(redisService: RedisService);
    private configs;
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    private getEndpointCategory;
}
