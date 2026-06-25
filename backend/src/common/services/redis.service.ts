import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private client: any;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err: any) => console.error('Redis Client Error', err));
    this.client.connect().catch((err: any) => console.error('Redis connect error', err));
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      await this.client.setEx(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async setWithExpiry(key: string, value: string, expireSeconds: number): Promise<void> {
    await this.client.setEx(key, expireSeconds, value);
  }

  async getTTL(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async getJSON(key: string): Promise<any> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJSON(key: string, value: any, expireSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), expireSeconds);
  }

  async getAndDelete(key: string): Promise<string | null> {
    const value = await this.get(key);
    if (value) await this.del(key);
    return value;
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
