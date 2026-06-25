// backend/src/common/enums/index.ts
// CRITICAL: Centralized enum definitions for DTOs

/**
 * User role enum - defines valid roles in system
 * Used by class-validator @IsEnum(UserRole)
 */
export enum UserRole {
  CUSTOMER = 'customer',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

/**
 * Booking status enum - defines all valid booking states
 */
export enum BookingStatus {
  PENDING = 'pending',
  REQUIRES_PAYMENT = 'requires_payment',
  PAYMENT_PROCESSING = 'payment_processing',
  CONFIRMED = 'confirmed',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Business category enum
 */
export enum BusinessCategory {
  CLEANING = 'cleaning',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  LANDSCAPING = 'landscaping',
  HANDYMAN = 'handyman',
  TUTORING = 'tutoring',
  FITNESS = 'fitness',
  OTHER = 'other',
}

/**
 * Business status enum - approval workflow
 */
export enum BusinessStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ACTIVE = 'active',
}

/**
 * Refund reason enum
 */
export enum RefundReason {
  CUSTOMER_REQUEST = 'requested_by_customer',
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  QUALITY_ISSUE = 'quality_issue',
  CANCELLATION = 'cancellation',
}

/**
 * Review status enum
 */
export enum ReviewStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  DELETED = 'deleted',
}

/**
 * Payment type enum - what kind of payment
 */
export enum PaymentType {
  BOOKING = 'booking',
  REFUND = 'refund',
  PAYOUT = 'payout',
}

// ============================================
// CORRECTED DTOs with proper @IsEnum usage
// ============================================
// DTO definitions moved to canonical files under `src/dtos/` to avoid duplicate
// declarations across the codebase. Re-export canonical DTOs from there.

export * from '../../dtos';

// ============================================
// Export all for convenience
// ============================================

export const ALL_ENUMS = {
  UserRole,
  BookingStatus,
  PaymentStatus,
  BusinessCategory,
  BusinessStatus,
  RefundReason,
  ReviewStatus,
  PaymentType,
};

// ============================================
// Type checking helpers
// ============================================

export function isValidUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

export function isValidBookingStatus(value: any): value is BookingStatus {
  return Object.values(BookingStatus).includes(value);
}

export function isValidBusinessCategory(
  value: any,
): value is BusinessCategory {
  return Object.values(BusinessCategory).includes(value);
}

// ============================================
// COMPILATION CHECKLIST
// ============================================

export const DTO_COMPILATION_CHECKLIST = `
✅ CORRECTED DTO PATTERN:

1. Enum Definition:
   - ✅ Define enum as TypeScript class/object
   - ❌ Don't use string arrays in decorators

2. @IsEnum Usage:
   - ✅ @IsEnum(EnumClass)
   - ❌ @IsEnum(['value1', 'value2'])

3. Example CORRECT:
   export enum UserRole {
     CUSTOMER = 'customer',
     BUSINESS = 'business',
   }

   export class RegisterDto {
     @IsEnum(UserRole)
     role: UserRole;
   }

4. Example WRONG (fixed):
   export class RegisterDto {
     @IsEnum(['customer', 'business'])
     role: string;
   }
   → Should be: @IsEnum(UserRole) role: UserRole;

5. Compilation Benefits:
   - ✅ Type safety (TypeScript compiler checks)
   - ✅ IDE autocomplete works
   - ✅ Runtime validation via class-validator
   - ✅ Clear valid values in code
   - ✅ Refactoring support (rename enum value = IDE updates all uses)

6. All DTOs Updated:
   - ✅ RegisterDto: @IsEnum(UserRole)
   - ✅ RegisterBusinessDto: @IsEnum(BusinessCategory)
   - ✅ CancelBookingDto: @IsEnum(RefundReason)
   - ✅ RefundPaymentDto: @IsEnum(RefundReason)

7. Type Guards Added:
   - ✅ isValidUserRole(value): value is UserRole
   - ✅ isValidBookingStatus(value): value is BookingStatus
   - ✅ isValidBusinessCategory(value): value is BusinessCategory
`;
