import { CustomerEntity } from './customer.entity';
import { BusinessEntity } from './business.entity';
export declare class UserEntity {
    id: string;
    email: string;
    mobile?: string;
    password_hash: string;
    reset_token_hash?: string | null;
    reset_token_expires_at?: Date | null;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    last_login_at?: Date;
    created_at: Date;
    updated_at: Date;
    customer?: CustomerEntity;
    business?: BusinessEntity;
    get phone_number(): string | undefined;
    set phone_number(value: string | undefined);
}
