import { UserEntity } from './user.entity';
export declare class CustomerEntity {
    id: string;
    address: string;
    suburb: string;
    postcode: string;
    state: string;
    latitude?: number;
    longitude?: number;
    phone_verified: boolean;
    email_verified: boolean;
    preferred_contact_method: string;
    saved_addresses?: any[];
    average_rating?: number;
    created_at: Date;
    updated_at: Date;
    user: UserEntity;
}
