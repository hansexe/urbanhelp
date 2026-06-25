"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const ioredis_1 = require("@nestjs-modules/ioredis");
// Entities
const user_entity_1 = require("./entities/user.entity");
const customer_entity_1 = require("./entities/customer.entity");
const business_entity_1 = require("./entities/business.entity");
const business_service_entity_1 = require("./entities/business-service.entity");
const business_hours_entity_1 = require("./entities/business-hours.entity");
const business_image_entity_1 = require("./entities/business-image.entity");
const business_banking_details_entity_1 = require("./entities/business-banking-details.entity");
const booking_entity_1 = require("./entities/booking.entity");
const payment_entity_1 = require("./entities/payment.entity");
const review_entity_1 = require("./entities/review.entity");
const notification_entity_1 = require("./entities/notification.entity");
const otp_code_entity_1 = require("./entities/otp-code.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
// Feature Modules
const auth_module_1 = require("./modules/auth/auth.module");
const businesses_module_1 = require("./modules/businesses/businesses.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const customers_module_1 = require("./modules/customers/customers.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const search_module_1 = require("./modules/search/search.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const location_module_1 = require("./modules/location/location.module");
const admin_module_1 = require("./modules/admin/admin.module");
const business_dashboard_module_1 = require("./modules/business-dashboard/business-dashboard.module");
const customer_dashboard_module_1 = require("./modules/customer-dashboard/customer-dashboard.module");
const cache_module_1 = require("./modules/cache/cache.module");
const queue_module_1 = require("./modules/queue/queue.module");
// Common Module
const common_module_1 = require("./common/common.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            // Database
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [
                    user_entity_1.UserEntity,
                    customer_entity_1.CustomerEntity,
                    business_entity_1.BusinessEntity,
                    business_service_entity_1.BusinessServiceEntity,
                    business_hours_entity_1.BusinessHoursEntity,
                    business_image_entity_1.BusinessImageEntity,
                    business_banking_details_entity_1.BusinessBankingDetailsEntity,
                    booking_entity_1.BookingEntity,
                    payment_entity_1.PaymentEntity,
                    review_entity_1.ReviewEntity,
                    notification_entity_1.NotificationEntity,
                    otp_code_entity_1.OtpCodeEntity,
                    audit_log_entity_1.AuditLogEntity,
                ],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
                ssl: process.env.DB_SSL === 'true'
                    ? {
                        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
                    }
                    : false,
            }),
            // Redis Cache
            ioredis_1.RedisModule.forRoot({
                config: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
                    retryStrategy: (times) => {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                },
            }),
            // Task Queue (Bull)
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
                },
            }),
            bull_1.BullModule.registerQueue({ name: 'email' }, { name: 'sms' }, { name: 'payout' }),
            // Scheduling
            schedule_1.ScheduleModule.forRoot(),
            // Feature Modules
            auth_module_1.AuthModule,
            businesses_module_1.BusinessesModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            customers_module_1.CustomersModule,
            notifications_module_1.NotificationsModule,
            search_module_1.SearchModule,
            uploads_module_1.UploadsModule,
            location_module_1.LocationModule,
            admin_module_1.AdminModule,
            business_dashboard_module_1.BusinessDashboardModule,
            customer_dashboard_module_1.CustomerDashboardModule,
            cache_module_1.CacheModule,
            queue_module_1.QueueModule,
            // Common Module
            common_module_1.CommonModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map