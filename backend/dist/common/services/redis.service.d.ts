export declare class RedisService {
    private client;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expireSeconds?: number): Promise<void>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    increment(key: string): Promise<number>;
    decrement(key: string): Promise<number>;
    setWithExpiry(key: string, value: string, expireSeconds: number): Promise<void>;
    getTTL(key: string): Promise<number>;
    getJSON(key: string): Promise<any>;
    setJSON(key: string, value: any, expireSeconds?: number): Promise<void>;
    getAndDelete(key: string): Promise<string | null>;
    flushAll(): Promise<void>;
    disconnect(): Promise<void>;
}
