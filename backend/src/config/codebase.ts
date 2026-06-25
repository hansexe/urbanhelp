// backend/src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'urbanhelp',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'urbanhelp',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../../database/migrations/*.ts')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  poolSize: 10,
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  expiresIn: '1h',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  refreshTokenExpiresIn: '7d',
});

export const stripeConfig = () => ({
  apiKey: process.env.STRIPE_API_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  connectApiKey: process.env.STRIPE_CONNECT_API_KEY || '',
});

export const twilioConfig = () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
});

export const sendgridConfig = () => ({
  apiKey: process.env.SENDGRID_API_KEY || '',
  fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@urbanhelp.com.au',
});

export const awsConfig = () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'ap-southeast-2',
  s3Bucket: process.env.AWS_S3_BUCKET || 'urban-help-images',
});

export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
    credentials: true,
  },
  rateLimiting: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  otpExpiry: 10 * 60 * 1000, // 10 minutes
  commissionPercentage: 0.1, // 10%
});

// backend/src/config/google-places.config.ts
export const googlePlacesConfig = () => ({
  apiKey: process.env.GOOGLE_PLACES_API_KEY || '',
});

// backend/src/constants/error.constants.ts
export enum ErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BUSINESS_NOT_FOUND = 'BUSINESS_NOT_FOUND',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_FILE = 'INVALID_FILE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
}

// backend/src/constants/app.constants.ts
export const AUSTRALIAN_STATES = [
  'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
];

export const SERVICE_TYPES = [
  'electrician',
  'plumber',
  'builder',
  'carpenter',
  'locksmith',
  'handyman',
  'other',
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DECLINED: 'declined',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const OTP_TYPES = {
  REGISTRATION: 'registration',
  LOGIN: 'login',
  PASSWORD_RESET: 'password_reset',
  EMAIL_CHANGE: 'email_change',
  PHONE_CHANGE: 'phone_change',
};

export const MAX_IMAGE_SIZE = 500 * 1024; // 500 KB
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MIN_BUSINESS_IMAGES = 3;
export const MAX_BUSINESS_IMAGES = 10;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
export const PHONE_REGEX = /^(\+61|0)[0-9]{9,10}$/;
export const ABN_REGEX = /^\d{11}$/;
export const BSB_REGEX = /^\d{6}$/;
export const ACCOUNT_NUMBER_REGEX = /^\d{8,12}$/;

export const SERVICE_RADIUS_MIN = 5;
export const SERVICE_RADIUS_MAX = 100;

export const COMMISSION_PERCENTAGE = 0.1; // 10%
