// backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../common/entities/user.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { OtpCodeEntity } from '../../common/entities/otp-code.entity';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';
import { jwtConfig, appConfig } from '../config/database.config';
import {
  PASSWORD_REGEX,
  PHONE_REGEX,
  OTP_TYPES,
} from '../constants/app.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(CustomerEntity)
    private customersRepository: Repository<CustomerEntity>,
    @InjectRepository(OtpCodeEntity)
    private otpRepository: Repository<OtpCodeEntity>,
    private jwtService: JwtService,
    private twilioService: TwilioService,
    private sendGridService: SendGridService,
  ) {}

  async register(registerDto: any) {
    const { email, password, mobile, firstName, lastName, address, suburb, postcode, state } = registerDto;

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      throw new BadRequestException(
        'Password must be 8-20 characters with uppercase, lowercase, number and special character',
      );
    }

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { mobile }],
    });

    if (existingUser) {
      throw new ConflictException('Email or mobile already registered');
    }

    // Validate phone number
    if (mobile && !PHONE_REGEX.test(mobile)) {
      throw new BadRequestException('Invalid Australian phone number');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = this.usersRepository.create({
      email,
      mobile,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'customer',
      is_verified: false,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create customer profile
    const customer = this.customersRepository.create({
      id: savedUser.id,
      address,
      suburb,
      postcode,
      state,
      email_verified: false,
      phone_verified: false,
    });

    await this.customersRepository.save(customer);

    // Generate and send OTPs
    await this.generateAndSendOtp(savedUser.id, savedUser.mobile, OTP_TYPES.REGISTRATION, 'sms');
    await this.generateAndSendOtp(savedUser.id, savedUser.email, OTP_TYPES.REGISTRATION, 'email');

    return {
      userId: savedUser.id,
      email: savedUser.email,
      message: 'Registration successful. OTP sent to email and mobile.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Update last login
    user.last_login_at = new Date();
    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async loginWithMobile(mobile: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { mobile },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    user.last_login_at = new Date();
    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async verifyOtp(userId: string, code: string, type: string) {
    const otp = await this.otpRepository.findOne({
      where: {
        user_id: userId,
        code,
        type,
        is_used: false,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > otp.expires_at) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as used
    otp.is_used = true;
    await this.otpRepository.save(otp);

    // Update user verification status
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (type === OTP_TYPES.REGISTRATION || type === OTP_TYPES.EMAIL_CHANGE) {
      user.is_verified = true;
      if (type === OTP_TYPES.REGISTRATION) {
        const customer = await this.customersRepository.findOne({ where: { id: userId } });
        customer.email_verified = true;
        await this.customersRepository.save(customer);
      }
    }

    if (type === OTP_TYPES.PHONE_CHANGE) {
      const customer = await this.customersRepository.findOne({ where: { id: userId } });
      customer.phone_verified = true;
      await this.customersRepository.save(customer);
    }

    await this.usersRepository.save(user);

    return { verified: true, message: 'OTP verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate OTP
    await this.generateAndSendOtp(user.id, email, OTP_TYPES.PASSWORD_RESET, 'email');

    return { message: 'Password reset OTP sent to email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = await this.otpRepository.findOne({
      where: {
        user_id: user.id,
        code,
        type: OTP_TYPES.PASSWORD_RESET,
        is_used: false,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (new Date() > otp.expires_at) {
      throw new BadRequestException('Reset code has expired');
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new BadRequestException(
        'Password must be 8-20 characters with uppercase, lowercase, number and special character',
      );
    }

    // Update password
    user.password_hash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.save(user);

    // Mark OTP as used
    otp.is_used = true;
    await this.otpRepository.save(otp);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new BadRequestException(
        'Password must be 8-20 characters with uppercase, lowercase, number and special character',
      );
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const config = jwtConfig();
      const payload = this.jwtService.verify(refreshToken, {
        secret: config.refreshTokenSecret,
      });

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: UserEntity) {
    const config = jwtConfig();
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: config.expiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: config.refreshTokenSecret,
      expiresIn: config.refreshTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        role: user.role,
      },
    };
  }

  private async generateAndSendOtp(userId: string, destination: string, type: string, channel: 'sms' | 'email') {
    // Clean up old OTPs
    await this.otpRepository.delete({
      user_id: userId,
      type,
      is_used: false,
    });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create OTP record
    const expiresAt = new Date(Date.now() + appConfig().otpExpiry);

    const otp = this.otpRepository.create({
      user_id: userId,
      code,
      type,
      expires_at: expiresAt,
    });

    await this.otpRepository.save(otp);

    // Send via SMS or Email
    if (channel === 'sms') {
      await this.twilioService.sendOtp(destination, code);
    } else {
      await this.sendGridService.sendOtpEmail(destination, code, type);
    }
  }
}

// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('login-mobile')
  @HttpCode(HttpStatus.OK)
  async loginWithMobile(@Body() loginDto: { mobile: string; password: string }) {
    return this.authService.loginWithMobile(loginDto.mobile, loginDto.password);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyDto: { userId: string; code: string; type: string }) {
    return this.authService.verifyOtp(verifyDto.userId, verifyDto.code, verifyDto.type);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotDto: { email: string }) {
    return this.authService.forgotPassword(forgotDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(resetDto.email, resetDto.code, resetDto.newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: { refreshToken: string }) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }
}

// backend/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../config/database.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig().secret,
    });
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

// backend/src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// backend/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// backend/src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../common/entities/user.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { OtpCodeEntity } from '../../common/entities/otp-code.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { jwtConfig } from '../config/database.config';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig().secret,
      signOptions: { expiresIn: jwtConfig().expiresIn },
    }),
    TypeOrmModule.forFeature([UserEntity, CustomerEntity, OtpCodeEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwilioService, SendGridService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
