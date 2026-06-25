export declare class RedisService {
    private client;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expireSeconds?: number): Promise<void>;
    del(key: string): Promise<number>;
}
