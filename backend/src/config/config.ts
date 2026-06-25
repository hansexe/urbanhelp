import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.BACKEND_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  logLevel: process.env.LOG_LEVEL || 'debug',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true',
  sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRY || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
}));

export const stripeConfig = registerAs('stripe', () => ({
  publicKey: process.env.STRIPE_PUBLIC_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  commissionPercentage: parseFloat(process.env.STRIPE_COMMISSION_PERCENTAGE || '10'),
}));

export const twilioConfig = registerAs('twilio', () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
}));

export const sendgridConfig = registerAs('sendgrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.SENDGRID_FROM_EMAIL,
  fromName: process.env.SENDGRID_FROM_NAME || 'Urban Help',
}));

export const awsConfig = registerAs('aws', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-2',
  s3Bucket: process.env.AWS_S3_BUCKET,
  s3CdnUrl: process.env.AWS_S3_CDN_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
}));

export const googlePlacesConfig = registerAs('googlePlaces', () => ({
  apiKey: process.env.GOOGLE_PLACES_API_KEY,
}));

export const rateLimitConfig = registerAs('rateLimit', () => ({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
}));

export const securityConfig = registerAs('security', () => ({
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
  passwordResetExpiryMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES || '15'),
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  accountLockoutMinutes: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30'),
  encryptionKey: process.env.ENCRYPTION_KEY,
  internalApiKey: process.env.INTERNAL_API_KEY,
}));

export const bookingConfig = registerAs('booking', () => ({
  minLeadTimeHours: parseInt(process.env.MIN_BOOKING_LEAD_TIME_HOURS || '2'),
  maxAdvanceDays: parseInt(process.env.MAX_BOOKING_ADVANCE_DAYS || '90'),
  refundFullHours: parseInt(process.env.REFUND_FULL_HOURS || '24'),
  refundPartialHours: parseInt(process.env.REFUND_PARTIAL_HOURS || '1'),
  refundPartialPercentage: parseInt(process.env.REFUND_PARTIAL_PERCENTAGE || '50'),
}));

export const notificationConfig = registerAs('notification', () => ({
  sendEmailNotifications: process.env.SEND_EMAIL_NOTIFICATIONS !== 'false',
  emailBatchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '100'),
  emailBatchIntervalSeconds: parseInt(process.env.EMAIL_BATCH_INTERVAL_SECONDS || '60'),
  sendSmsNotifications: process.env.SEND_SMS_NOTIFICATIONS !== 'false',
  smsBatchSize: parseInt(process.env.SMS_BATCH_SIZE || '50'),
  smsBatchIntervalSeconds: parseInt(process.env.SMS_BATCH_INTERVAL_SECONDS || '30'),
}));

export const adminConfig = registerAs('admin', () => ({
  email: process.env.ADMIN_EMAIL,
}));

export interface Config {
  app: ReturnType<typeof appConfig>;
  database: ReturnType<typeof databaseConfig>;
  jwt: ReturnType<typeof jwtConfig>;
  stripe: ReturnType<typeof stripeConfig>;
  twilio: ReturnType<typeof twilioConfig>;
  sendgrid: ReturnType<typeof sendgridConfig>;
  aws: ReturnType<typeof awsConfig>;
  redis: ReturnType<typeof redisConfig>;
  googlePlaces: ReturnType<typeof googlePlacesConfig>;
  rateLimit: ReturnType<typeof rateLimitConfig>;
  security: ReturnType<typeof securityConfig>;
  booking: ReturnType<typeof bookingConfig>;
  notification: ReturnType<typeof notificationConfig>;
  admin: ReturnType<typeof adminConfig>;
}
