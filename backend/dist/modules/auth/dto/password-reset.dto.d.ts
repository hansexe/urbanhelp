/**
 * DTO for initiating password reset
 * Only requires email - no password data exposed
 */
export declare class PasswordResetInitiateDto {
    email: string;
}
/**
 * DTO for completing password reset
 * Validates password strength before reset
 */
export declare class PasswordResetCompleteDto {
    email: string;
    token: string;
    newPassword: string;
}
