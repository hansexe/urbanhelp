"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const ioredis_1 = require("@nestjs-modules/ioredis");
const health_module_1 = require("./modules/health/health.module");
// Database configuration
const database_1 = __importDefault(require("./database"));
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
const security_module_1 = require("./modules/security/security.module");
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
            // Database - Using TypeORM DataSource configured in src/database.ts
            typeorm_1.TypeOrmModule.forRoot(database_1.default.options),
            // Redis Cache
            ioredis_1.RedisModule.forRoot({
                type: 'single',
                options: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
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
            // Queue registrations are handled in the canonical QueueModule
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
            security_module_1.SecurityModule,
            health_module_1.HealthModule,
            // Common Module
            common_module_1.CommonModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map