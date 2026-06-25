export declare const appConfig: (() => {
    nodeEnv: string;
    port: number;
    host: string;
    corsOrigin: string;
    corsCredentials: boolean;
    logLevel: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    host: string;
    corsOrigin: string;
    corsCredentials: boolean;
    logLevel: string;
}>;
export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    ssl: boolean;
    sslRejectUnauthorized: boolean;
    synchronize: boolean;
    logging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    ssl: boolean;
    sslRejectUnauthorized: boolean;
    synchronize: boolean;
    logging: boolean;
}>;
export declare const jwtConfig: (() => {
    secret: string | undefined;
    expiresIn: string;
    refreshSecret: string | undefined;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string | undefined;
    expiresIn: string;
    refreshSecret: string | undefined;
    refreshExpiresIn: string;
}>;
export declare const stripeConfig: (() => {
    publicKey: string | undefined;
    secretKey: string | undefined;
    webhookSecret: string | undefined;
    commissionPercentage: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    publicKey: string | undefined;
    secretKey: string | undefined;
    webhookSecret: string | undefined;
    commissionPercentage: number;
}>;
export declare const twilioConfig: (() => {
    accountSid: string | undefined;
    authToken: string | undefined;
    phoneNumber: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accountSid: string | undefined;
    authToken: string | undefined;
    phoneNumber: string | undefined;
}>;
export declare const sendgridConfig: (() => {
    apiKey: string | undefined;
    fromEmail: string | undefined;
    fromName: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    apiKey: string | undefined;
    fromEmail: string | undefined;
    fromName: string;
}>;
export declare const awsConfig: (() => {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string;
    s3Bucket: string | undefined;
    s3CdnUrl: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string;
    s3Bucket: string | undefined;
    s3CdnUrl: string | undefined;
}>;
export declare const redisConfig: (() => {
    host: string;
    port: number;
    password: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string | undefined;
}>;
export declare const googlePlacesConfig: (() => {
    apiKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    apiKey: string | undefined;
}>;
export declare const rateLimitConfig: (() => {
    windowMs: number;
    maxRequests: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    windowMs: number;
    maxRequests: number;
}>;
export declare const securityConfig: (() => {
    otpExpiryMinutes: number;
    passwordResetExpiryMinutes: number;
    maxLoginAttempts: number;
    accountLockoutMinutes: number;
    encryptionKey: string | undefined;
    internalApiKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    otpExpiryMinutes: number;
    passwordResetExpiryMinutes: number;
    maxLoginAttempts: number;
    accountLockoutMinutes: number;
    encryptionKey: string | undefined;
    internalApiKey: string | undefined;
}>;
export declare const bookingConfig: (() => {
    minLeadTimeHours: number;
    maxAdvanceDays: number;
    refundFullHours: number;
    refundPartialHours: number;
    refundPartialPercentage: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    minLeadTimeHours: number;
    maxAdvanceDays: number;
    refundFullHours: number;
    refundPartialHours: number;
    refundPartialPercentage: number;
}>;
export declare const notificationConfig: (() => {
    sendEmailNotifications: boolean;
    emailBatchSize: number;
    emailBatchIntervalSeconds: number;
    sendSmsNotifications: boolean;
    smsBatchSize: number;
    smsBatchIntervalSeconds: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    sendEmailNotifications: boolean;
    emailBatchSize: number;
    emailBatchIntervalSeconds: number;
    sendSmsNotifications: boolean;
    smsBatchSize: number;
    smsBatchIntervalSeconds: number;
}>;
export declare const adminConfig: (() => {
    email: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    email: string | undefined;
}>;
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
