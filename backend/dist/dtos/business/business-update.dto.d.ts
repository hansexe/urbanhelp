import { BusinessServiceDto, BusinessHoursDto } from './business-registration.dto';
/**
 * Business Profile Update DTO
 * Allows business owners to update their profile information
 * All fields are optional to support partial updates
 */
export declare class UpdateBusinessProfileDto {
    businessName?: string;
    description?: string;
    experience?: string;
    qualifications?: string;
    licences?: string;
    websiteUrl?: string;
    serviceRadius?: number;
    services?: BusinessServiceDto[];
    businessHours?: BusinessHoursDto[];
}
/**
 * Update Banking Details DTO
 * Allows business owners to update their banking information
 */
export declare class UpdateBankingDetailsDto {
    accountName: string;
    bsb: string;
    accountNumber: string;
}
