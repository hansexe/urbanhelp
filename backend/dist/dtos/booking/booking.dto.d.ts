/**
 * CreateBookingDto
 * Validated request to create a new booking
 *
 * Validation:
 * - customerId: must be valid UUID
 * - businessId: must be valid UUID
 * - serviceId: must be valid UUID
 * - scheduledDate: must be Date in future
 * - duration_hours: must be 1-24 hours
 * - location: required, max 255 chars
 *
 * Authorization: CUSTOMER role only
 */
export declare class CreateBookingDto {
    businessId: string;
    customerId: string;
    serviceId: string;
    scheduledDate: Date;
    duration_hours: number;
    location: string;
    notes?: string;
}
/**
 * UpdateBookingDto
 * Validated request to update a pending booking
 *
 * Immutable Fields (cannot be modified):
 * - bookingId: system identifier
 * - status: cannot change via update (only via state transitions)
 * - customerId: owner cannot change
 * - businessId: cannot change business
 * - serviceId: cannot change service
 * - createdAt: creation timestamp
 * - confirmedAt: confirmation timestamp
 *
 * Allowed Updates (when status = PENDING):
 * - scheduledDate: new booking date/time (future only)
 * - duration_hours: new duration (1-24 hours)
 * - location: new location
 * - notes: additional notes
 *
 * Authorization: CUSTOMER role, booking owner only
 */
export declare class UpdateBookingDto {
    scheduledDate?: Date;
    duration_hours?: number;
    location?: string;
    notes?: string;
}
/**
 * CancelBookingDto
 * Validated request to cancel a booking
 *
 * Required:
 * - reason: cancellation reason for audit trail
 *
 * Refund Rules:
 * - > 24 hours: 100% refund
 * - ≤ 24 hours: 50% refund
 * - Completed/NoShow: 0% refund
 *
 * Authorization: CUSTOMER (own booking) or BUSINESS (own business)
 */
export declare class CancelBookingDto {
    reason: string;
}
/**
 * ConfirmBookingDto
 * Validated request to confirm a booking
 *
 * Status Transition: PENDING → CONFIRMED
 *
 * Authorization: BUSINESS role, business owner only
 */
export declare class ConfirmBookingDto {
}
/**
 * CompleteBookingDto
 * Validated request to mark booking as complete
 *
 * Status Transition: CONFIRMED → COMPLETED
 *
 * Authorization: BUSINESS role, business owner only
 */
export declare class CompleteBookingDto {
}
/**
 * NoShowBookingDto
 * Validated request to mark booking as no-show
 *
 * Status Transition: CONFIRMED → NO_SHOW
 *
 * Authorization: BUSINESS role, business owner only
 */
export declare class NoShowBookingDto {
}
