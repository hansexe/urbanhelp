/**
 * User role enum - defines valid roles in system
 * Used by class-validator @IsEnum(UserRole)
 */
export declare enum UserRole {
    CUSTOMER = "customer",
    BUSINESS = "business",
    ADMIN = "admin"
}
/**
 * Booking status enum - defines all valid booking states
 */
export declare enum BookingStatus {
    PENDING = "pending",
    REQUIRES_PAYMENT = "requires_payment",
    PAYMENT_PROCESSING = "payment_processing",
    CONFIRMED = "confirmed",
    ACCEPTED = "accepted",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
/**
 * Payment status enum
 */
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    REFUNDED = "refunded"
}
/**
 * Business category enum
 */
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
/**
 * Business status enum - approval workflow
 */
export declare enum BusinessStatus {
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended",
    ACTIVE = "active"
}
/**
 * Refund reason enum
 */
export declare enum RefundReason {
    CUSTOMER_REQUEST = "requested_by_customer",
    DUPLICATE = "duplicate",
    FRAUDULENT = "fraudulent",
    SERVICE_NOT_PROVIDED = "service_not_provided",
    QUALITY_ISSUE = "quality_issue",
    CANCELLATION = "cancellation"
}
/**
 * Review status enum
 */
export declare enum ReviewStatus {
    PENDING = "pending",
    PUBLISHED = "published",
    DELETED = "deleted"
}
/**
 * Payment type enum - what kind of payment
 */
export declare enum PaymentType {
    BOOKING = "booking",
    REFUND = "refund",
    PAYOUT = "payout"
}
export * from '../../dtos';
export declare const ALL_ENUMS: {
    UserRole: typeof UserRole;
    BookingStatus: typeof BookingStatus;
    PaymentStatus: typeof PaymentStatus;
    BusinessCategory: typeof BusinessCategory;
    BusinessStatus: typeof BusinessStatus;
    RefundReason: typeof RefundReason;
    ReviewStatus: typeof ReviewStatus;
    PaymentType: typeof PaymentType;
};
export declare function isValidUserRole(value: any): value is UserRole;
export declare function isValidBookingStatus(value: any): value is BookingStatus;
export declare function isValidBusinessCategory(value: any): value is BusinessCategory;
export declare const DTO_COMPILATION_CHECKLIST = "\n\u2705 CORRECTED DTO PATTERN:\n\n1. Enum Definition:\n   - \u2705 Define enum as TypeScript class/object\n   - \u274C Don't use string arrays in decorators\n\n2. @IsEnum Usage:\n   - \u2705 @IsEnum(EnumClass)\n   - \u274C @IsEnum(['value1', 'value2'])\n\n3. Example CORRECT:\n   export enum UserRole {\n     CUSTOMER = 'customer',\n     BUSINESS = 'business',\n   }\n\n   export class RegisterDto {\n     @IsEnum(UserRole)\n     role: UserRole;\n   }\n\n4. Example WRONG (fixed):\n   export class RegisterDto {\n     @IsEnum(['customer', 'business'])\n     role: string;\n   }\n   \u2192 Should be: @IsEnum(UserRole) role: UserRole;\n\n5. Compilation Benefits:\n   - \u2705 Type safety (TypeScript compiler checks)\n   - \u2705 IDE autocomplete works\n   - \u2705 Runtime validation via class-validator\n   - \u2705 Clear valid values in code\n   - \u2705 Refactoring support (rename enum value = IDE updates all uses)\n\n6. All DTOs Updated:\n   - \u2705 RegisterDto: @IsEnum(UserRole)\n   - \u2705 RegisterBusinessDto: @IsEnum(BusinessCategory)\n   - \u2705 CancelBookingDto: @IsEnum(RefundReason)\n   - \u2705 RefundPaymentDto: @IsEnum(RefundReason)\n\n7. Type Guards Added:\n   - \u2705 isValidUserRole(value): value is UserRole\n   - \u2705 isValidBookingStatus(value): value is BookingStatus\n   - \u2705 isValidBusinessCategory(value): value is BusinessCategory\n";
