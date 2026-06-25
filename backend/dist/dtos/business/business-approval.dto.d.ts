/**
 * Approve Business DTO
 * Used by admins to approve pending business registrations
 */
export declare class ApproveBusinessDto {
    businessId: string;
    adminNotes?: string;
}
/**
 * Reject Business DTO
 * Used by admins to reject pending business registrations
 */
export declare class RejectBusinessDto {
    businessId: string;
    rejectionReason: string;
}
