import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare const databaseConfig: () => TypeOrmModuleOptions;
export declare const jwtConfig: () => {
    secret: string;
    expiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
};
export declare const stripeConfig: () => {
    apiKey: string;
    webhookSecret: string;
    connectApiKey: string;
};
export declare const twilioConfig: () => {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
};
export declare const sendgridConfig: () => {
    apiKey: string;
    fromEmail: string;
};
export declare const awsConfig: () => {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
};
export declare const appConfig: () => {
    port: number;
    nodeEnv: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    rateLimiting: {
        windowMs: number;
        maxRequests: number;
    };
    otpExpiry: number;
    commissionPercentage: number;
};
export declare const googlePlacesConfig: () => {
    apiKey: string;
};
export declare enum ErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
    INVALID_OTP = "INVALID_OTP",
    OTP_EXPIRED = "OTP_EXPIRED",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    BUSINESS_NOT_FOUND = "BUSINESS_NOT_FOUND",
    BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    INVALID_FILE = "INVALID_FILE",
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
}
export declare const AUSTRALIAN_STATES: string[];
export declare const SERVICE_TYPES: string[];
export declare const BOOKING_STATUS: {
    PENDING: string;
    ACCEPTED: string;
    PAYMENT_PENDING: string;
    CONFIRMED: string;
    COMPLETED: string;
    CANCELLED: string;
    DECLINED: string;
};
export declare const PAYMENT_STATUS: {
    PENDING: string;
    COMPLETED: string;
    FAILED: string;
    REFUNDED: string;
};
export declare const OTP_TYPES: {
    REGISTRATION: string;
    LOGIN: string;
    PASSWORD_RESET: string;
    EMAIL_CHANGE: string;
    PHONE_CHANGE: string;
};
export declare const MAX_IMAGE_SIZE: number;
export declare const ALLOWED_IMAGE_MIME_TYPES: string[];
export declare const MIN_BUSINESS_IMAGES = 3;
export declare const MAX_BUSINESS_IMAGES = 10;
export declare const PASSWORD_REGEX: RegExp;
export declare const PHONE_REGEX: RegExp;
export declare const ABN_REGEX: RegExp;
export declare const BSB_REGEX: RegExp;
export declare const ACCOUNT_NUMBER_REGEX: RegExp;
export declare const SERVICE_RADIUS_MIN = 5;
export declare const SERVICE_RADIUS_MAX = 100;
export declare const COMMISSION_PERCENTAGE = 0.1;
