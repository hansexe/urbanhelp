import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserEntity } from '../../common/entities/user.entity';
/**
 * Authentication Service
 *
 * Handles:
 * - User validation against password hash
 * - JWT token generation with role information
 *
 * Security:
 * - Passwords compared using bcrypt.compare() (timing-safe)
 * - JWT secret loaded from ConfigService (not env directly)
 * - Role included in JWT for authorization
 * - No sensitive data stored in JWT except userId, email, role
 */
export declare class AuthService {
    private jwtService;
    private configService;
    private userRepository;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, userRepository: Repository<UserEntity>);
    /**
     * Validate user credentials
     * Uses bcrypt.compare for timing-safe comparison
     * Returns user if valid, null otherwise (no info leakage)
     */
    validateUser(email: string, password: string): Promise<UserEntity | null>;
    /**
     * Generate JWT token for authenticated user
     * Includes userId, email, and role in JWT for authorization checks
     */
    login(user: UserEntity): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: string;
        };
    }>;
}
