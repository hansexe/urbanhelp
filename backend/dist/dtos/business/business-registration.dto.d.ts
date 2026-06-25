/**
 * Business Registration DTO
 * Validates all required fields for business registration
 * Includes validation for ABN, banking details, services, and hours
 */
export declare class BusinessServiceDto {
    serviceType: string;
    businessHoursFee: number;
    outOfHoursFee: number;
}
export declare class BusinessHoursDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export declare class BusinessBankingDetailsDto {
    accountName: string;
    bsb: string;
    accountNumber: string;
}
export declare class BusinessRegistrationDto {
    businessName: string;
    abn: string;
    ownerName: string;
    businessEmail: string;
    businessMobile: string;
    businessAddress: string;
    suburb: string;
    postcode: string;
    state: string;
    serviceRadius: number;
    websiteUrl?: string;
    description: string;
    experience: string;
    qualifications: string;
    licences?: string;
    password: string;
    services: BusinessServiceDto[];
    businessHours: BusinessHoursDto[];
    banking: BusinessBankingDetailsDto;
}
