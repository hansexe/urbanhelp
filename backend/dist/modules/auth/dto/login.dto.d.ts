/**
 * Login DTO
 * Validates email and password format
 *
 * Security:
 * - Email must be valid format
 * - Password must be non-empty (actual validation happens in AuthService)
 * - No password strength validation on login (only on reset)
 */
export declare class LoginDto {
    email: string;
    password: string;
}
