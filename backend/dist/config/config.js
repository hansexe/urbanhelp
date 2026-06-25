"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminConfig = exports.notificationConfig = exports.bookingConfig = exports.securityConfig = exports.rateLimitConfig = exports.googlePlacesConfig = exports.redisConfig = exports.awsConfig = exports.sendgridConfig = exports.twilioConfig = exports.stripeConfig = exports.jwtConfig = exports.databaseConfig = exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.BACKEND_HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    logLevel: process.env.LOG_LEVEL || 'debug',
}));
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
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
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
}));
exports.stripeConfig = (0, config_1.registerAs)('stripe', () => ({
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    commissionPercentage: parseFloat(process.env.STRIPE_COMMISSION_PERCENTAGE || '10'),
}));
exports.twilioConfig = (0, config_1.registerAs)('twilio', () => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
}));
exports.sendgridConfig = (0, config_1.registerAs)('sendgrid', () => ({
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME || 'Urban Help',
}));
exports.awsConfig = (0, config_1.registerAs)('aws', () => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-2',
    s3Bucket: process.env.AWS_S3_BUCKET,
    s3CdnUrl: process.env.AWS_S3_CDN_URL,
}));
exports.redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
}));
exports.googlePlacesConfig = (0, config_1.registerAs)('googlePlaces', () => ({
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
}));
exports.rateLimitConfig = (0, config_1.registerAs)('rateLimit', () => ({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
}));
exports.securityConfig = (0, config_1.registerAs)('security', () => ({
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
    passwordResetExpiryMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES || '15'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    accountLockoutMinutes: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30'),
    encryptionKey: process.env.ENCRYPTION_KEY,
    internalApiKey: process.env.INTERNAL_API_KEY,
}));
exports.bookingConfig = (0, config_1.registerAs)('booking', () => ({
    minLeadTimeHours: parseInt(process.env.MIN_BOOKING_LEAD_TIME_HOURS || '2'),
    maxAdvanceDays: parseInt(process.env.MAX_BOOKING_ADVANCE_DAYS || '90'),
    refundFullHours: parseInt(process.env.REFUND_FULL_HOURS || '24'),
    refundPartialHours: parseInt(process.env.REFUND_PARTIAL_HOURS || '1'),
    refundPartialPercentage: parseInt(process.env.REFUND_PARTIAL_PERCENTAGE || '50'),
}));
exports.notificationConfig = (0, config_1.registerAs)('notification', () => ({
    sendEmailNotifications: process.env.SEND_EMAIL_NOTIFICATIONS !== 'false',
    emailBatchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '100'),
    emailBatchIntervalSeconds: parseInt(process.env.EMAIL_BATCH_INTERVAL_SECONDS || '60'),
    sendSmsNotifications: process.env.SEND_SMS_NOTIFICATIONS !== 'false',
    smsBatchSize: parseInt(process.env.SMS_BATCH_SIZE || '50'),
    smsBatchIntervalSeconds: parseInt(process.env.SMS_BATCH_INTERVAL_SECONDS || '30'),
}));
exports.adminConfig = (0, config_1.registerAs)('admin', () => ({
    email: process.env.ADMIN_EMAIL,
}));
//# sourceMappingURL=config.js.map