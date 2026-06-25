export declare enum BusinessCategory {
    CLEANING = "cleaning",
    PLUMBING = "plumbing",
    ELECTRICAL = "electrical",
    LANDSCAPING = "landscaping",
    HANDYMAN = "handyman",
    TUTORING = "tutoring",
    FITNESS = "fitness",
    OTHER = "other"
}
export declare class RegisterBusinessDto {
    name: string;
    abn: string;
    category: BusinessCategory;
    email: string;
    phone: string;
    description?: string;
    website?: string;
    suburb: string;
    state: string;
    postcode: string;
    street_address: string;
}
export declare class UpdateBusinessProfileDto {
    name?: string;
    description?: string;
    website?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    street_address?: string;
}
export declare class BusinessBankingDetailsDto {
    bsb: string;
    account_number: string;
    account_holder_name: string;
}
