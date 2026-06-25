import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import * as bcrypt from 'bcrypt';

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
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Validate user credentials
   * Uses bcrypt.compare for timing-safe comparison
   * Returns user if valid, null otherwise (no info leakage)
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    if (!email || !password) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: [
        'id',
        'email',
        'password_hash',
        'role',
        'is_active',
        'is_verified',
        'first_name',
        'last_name',
      ],
    });

    if (!user) {
      // Intentionally don't reveal if user exists (prevents enumeration)
      return null;
    }

    if (!user.is_active) {
      this.logger.warn(`Login attempt on inactive user: ${user.id}`);
      return null;
    }

    // Use bcrypt.compare for timing-safe comparison
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate JWT token for authenticated user
   * Includes userId, email, and role in JWT for authorization checks
   */
  async login(user: UserEntity) {
    if (!user.id || !user.email) {
      throw new UnauthorizedException('Invalid user data');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET not configured');
      throw new Error('Authentication service misconfigured');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    };
  }
}
