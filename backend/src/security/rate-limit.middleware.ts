import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../common/services/redis.service';

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
        throw new HttpException(
          config!.message || `Rate limit exceeded for ${endpoint}`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      res.setHeader('X-RateLimit-Limit', config!.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config!.maxRequests - current);
      res.setHeader('X-RateLimit-Reset', Date.now() + config!.windowMs);

      next();
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
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
