"use strict";
// backend/src/config/database.config.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMISSION_PERCENTAGE = exports.SERVICE_RADIUS_MAX = exports.SERVICE_RADIUS_MIN = exports.ACCOUNT_NUMBER_REGEX = exports.BSB_REGEX = exports.ABN_REGEX = exports.PHONE_REGEX = exports.PASSWORD_REGEX = exports.MAX_BUSINESS_IMAGES = exports.MIN_BUSINESS_IMAGES = exports.ALLOWED_IMAGE_MIME_TYPES = exports.MAX_IMAGE_SIZE = exports.OTP_TYPES = exports.PAYMENT_STATUS = exports.BOOKING_STATUS = exports.SERVICE_TYPES = exports.AUSTRALIAN_STATES = exports.ErrorCode = exports.googlePlacesConfig = exports.appConfig = exports.awsConfig = exports.sendgridConfig = exports.twilioConfig = exports.stripeConfig = exports.jwtConfig = exports.databaseConfig = void 0;
const path = __importStar(require("path"));
const databaseConfig = () => ({
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
exports.databaseConfig = databaseConfig;
const jwtConfig = () => ({
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: '1h',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshTokenExpiresIn: '7d',
});
exports.jwtConfig = jwtConfig;
const stripeConfig = () => ({
    apiKey: process.env.STRIPE_API_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    connectApiKey: process.env.STRIPE_CONNECT_API_KEY || '',
});
exports.stripeConfig = stripeConfig;
const twilioConfig = () => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
});
exports.twilioConfig = twilioConfig;
const sendgridConfig = () => ({
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@urbanhelp.com.au',
});
exports.sendgridConfig = sendgridConfig;
const awsConfig = () => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-southeast-2',
    s3Bucket: process.env.AWS_S3_BUCKET || 'urban-help-images',
});
exports.awsConfig = awsConfig;
const appConfig = () => ({
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
exports.appConfig = appConfig;
// backend/src/config/google-places.config.ts
const googlePlacesConfig = () => ({
    apiKey: process.env.GOOGLE_PLACES_API_KEY || '',
});
exports.googlePlacesConfig = googlePlacesConfig;
// backend/src/constants/error.constants.ts
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    ErrorCode["INVALID_OTP"] = "INVALID_OTP";
    ErrorCode["OTP_EXPIRED"] = "OTP_EXPIRED";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["BUSINESS_NOT_FOUND"] = "BUSINESS_NOT_FOUND";
    ErrorCode["BOOKING_NOT_FOUND"] = "BOOKING_NOT_FOUND";
    ErrorCode["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    ErrorCode["INVALID_FILE"] = "INVALID_FILE";
    ErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// backend/src/constants/app.constants.ts
exports.AUSTRALIAN_STATES = [
    'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
];
exports.SERVICE_TYPES = [
    'electrician',
    'plumber',
    'builder',
    'carpenter',
    'locksmith',
    'handyman',
    'other',
];
exports.BOOKING_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PAYMENT_PENDING: 'payment_pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DECLINED: 'declined',
};
exports.PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};
exports.OTP_TYPES = {
    REGISTRATION: 'registration',
    LOGIN: 'login',
    PASSWORD_RESET: 'password_reset',
    EMAIL_CHANGE: 'email_change',
    PHONE_CHANGE: 'phone_change',
};
exports.MAX_IMAGE_SIZE = 500 * 1024; // 500 KB
exports.ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
exports.MIN_BUSINESS_IMAGES = 3;
exports.MAX_BUSINESS_IMAGES = 10;
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
exports.PHONE_REGEX = /^(\+61|0)[0-9]{9,10}$/;
exports.ABN_REGEX = /^\d{11}$/;
exports.BSB_REGEX = /^\d{6}$/;
exports.ACCOUNT_NUMBER_REGEX = /^\d{8,12}$/;
exports.SERVICE_RADIUS_MIN = 5;
exports.SERVICE_RADIUS_MAX = 100;
exports.COMMISSION_PERCENTAGE = 0.1; // 10%
//# sourceMappingURL=codebase.js.map