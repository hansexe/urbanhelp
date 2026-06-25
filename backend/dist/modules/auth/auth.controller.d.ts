import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetInitiateDto, PasswordResetCompleteDto } from './dto/password-reset.dto';
/**
 * Authentication Controller
 *
 * Handles:
 * - Login with email/password
 * - Password reset initiation (forgot password)
 * - Password reset completion (with token)
 * - JWT validation (automatic via JwtAuthGuard)
 *
 * Security Notes:
 * - All endpoints use ValidationPipe to validate DTOs
 * - Password reset endpoints use timing-attack resistant comparison
 * - No sensitive data (passwords) logged or returned
 * - All auth failures return generic 401 to prevent user enumeration
 */
export declare class AuthController {
    private authService;
    private passwordResetService;
    private readonly logger;
    constructor(authService: AuthService, passwordResetService: PasswordResetService);
    /**
     * Login endpoint
     * Returns JWT access token for subsequent requests
     */
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: string;
        };
    }>;
    /**
     * Initiate password reset
     * Sends reset email to user if account exists
     * Returns generic success message to prevent user enumeration
     */
    initiatePasswordReset(dto: PasswordResetInitiateDto): Promise<{
        message: string;
    }>;
    /**
     * Complete password reset
     * Validates token and sets new password
     */
    completePasswordReset(dto: PasswordResetCompleteDto): Promise<{
        message: string;
    }>;
    /**
     * Verify JWT token is valid (protected endpoint)
     * Used by frontend to check if stored token is still valid
     */
    verifyToken(): Promise<{
        message: string;
    }>;
}
