"use strict";
// backend/src/common/enums/index.ts
// CRITICAL: Centralized enum definitions for DTOs
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTO_COMPILATION_CHECKLIST = exports.ALL_ENUMS = exports.PaymentType = exports.ReviewStatus = exports.RefundReason = exports.BusinessStatus = exports.BusinessCategory = exports.PaymentStatus = exports.BookingStatus = exports.UserRole = void 0;
exports.isValidUserRole = isValidUserRole;
exports.isValidBookingStatus = isValidBookingStatus;
exports.isValidBusinessCategory = isValidBusinessCategory;
/**
 * User role enum - defines valid roles in system
 * Used by class-validator @IsEnum(UserRole)
 */
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["BUSINESS"] = "business";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Booking status enum - defines all valid booking states
 */
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["REQUIRES_PAYMENT"] = "requires_payment";
    BookingStatus["PAYMENT_PROCESSING"] = "payment_processing";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["ACCEPTED"] = "accepted";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
/**
 * Payment status enum
 */
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["SUCCEEDED"] = "succeeded";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
/**
 * Business category enum
 */
var BusinessCategory;
(function (BusinessCategory) {
    BusinessCategory["CLEANING"] = "cleaning";
    BusinessCategory["PLUMBING"] = "plumbing";
    BusinessCategory["ELECTRICAL"] = "electrical";
    BusinessCategory["LANDSCAPING"] = "landscaping";
    BusinessCategory["HANDYMAN"] = "handyman";
    BusinessCategory["TUTORING"] = "tutoring";
    BusinessCategory["FITNESS"] = "fitness";
    BusinessCategory["OTHER"] = "other";
})(BusinessCategory || (exports.BusinessCategory = BusinessCategory = {}));
/**
 * Business status enum - approval workflow
 */
var BusinessStatus;
(function (BusinessStatus) {
    BusinessStatus["PENDING_APPROVAL"] = "pending_approval";
    BusinessStatus["APPROVED"] = "approved";
    BusinessStatus["REJECTED"] = "rejected";
    BusinessStatus["SUSPENDED"] = "suspended";
    BusinessStatus["ACTIVE"] = "active";
})(BusinessStatus || (exports.BusinessStatus = BusinessStatus = {}));
/**
 * Refund reason enum
 */
var RefundReason;
(function (RefundReason) {
    RefundReason["CUSTOMER_REQUEST"] = "requested_by_customer";
    RefundReason["DUPLICATE"] = "duplicate";
    RefundReason["FRAUDULENT"] = "fraudulent";
    RefundReason["SERVICE_NOT_PROVIDED"] = "service_not_provided";
    RefundReason["QUALITY_ISSUE"] = "quality_issue";
    RefundReason["CANCELLATION"] = "cancellation";
})(RefundReason || (exports.RefundReason = RefundReason = {}));
/**
 * Review status enum
 */
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["PENDING"] = "pending";
    ReviewStatus["PUBLISHED"] = "published";
    ReviewStatus["DELETED"] = "deleted";
})(ReviewStatus || (exports.ReviewStatus = ReviewStatus = {}));
/**
 * Payment type enum - what kind of payment
 */
var PaymentType;
(function (PaymentType) {
    PaymentType["BOOKING"] = "booking";
    PaymentType["REFUND"] = "refund";
    PaymentType["PAYOUT"] = "payout";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
// ============================================
// CORRECTED DTOs with proper @IsEnum usage
// ============================================
// DTO definitions moved to canonical files under `src/dtos/` to avoid duplicate
// declarations across the codebase. Re-export canonical DTOs from there.
__exportStar(require("../../dtos"), exports);
// ============================================
// Export all for convenience
// ============================================
exports.ALL_ENUMS = {
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
function isValidUserRole(value) {
    return Object.values(UserRole).includes(value);
}
function isValidBookingStatus(value) {
    return Object.values(BookingStatus).includes(value);
}
function isValidBusinessCategory(value) {
    return Object.values(BusinessCategory).includes(value);
}
// ============================================
// COMPILATION CHECKLIST
// ============================================
exports.DTO_COMPILATION_CHECKLIST = `
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
//# sourceMappingURL=index.js.map