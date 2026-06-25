"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../../common/entities/business.entity");
const business_service_entity_1 = require("../../common/entities/business-service.entity");
const business_hours_entity_1 = require("../../common/entities/business-hours.entity");
const booking_service_1 = require("../bookings/booking.service");
const payment_entity_1 = require("../../common/entities/payment.entity");
let BusinessDashboardService = class BusinessDashboardService {
    constructor(businessRepository, serviceRepository, hoursRepository, bookingRepository, paymentRepository) {
        this.businessRepository = businessRepository;
        this.serviceRepository = serviceRepository;
        this.hoursRepository = hoursRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }
    async getDashboardOverview(businessId) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, totalRevenue, monthlyRevenue,] = await Promise.all([
            this.bookingRepository.countBy({ business_id: businessId }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: booking_service_1.BookingStatus.PENDING,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: booking_service_1.BookingStatus.CONFIRMED,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: booking_service_1.BookingStatus.COMPLETED,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: booking_service_1.BookingStatus.CANCELLED,
            }),
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
            }),
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
                created_at: (0, typeorm_2.Between)(monthStart, now),
            }),
        ]);
        const cancellationRate = totalBookings > 0
            ? (cancelledBookings / totalBookings) * 100
            : 0;
        return {
            totalBookings,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            totalRevenue: totalRevenue || 0,
            monthlyRevenue: monthlyRevenue || 0,
            averageRating: business.average_rating,
            totalReviews: business.total_reviews,
            cancellationRate: Math.round(cancellationRate),
        };
    }
    async getBusinessProfile(businessId) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
            relations: ['services', 'hours', 'images', 'banking_details', 'user'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        return business;
    }
    async updateBusinessProfile(businessId, updates) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        // Only allow certain fields to be updated
        const allowedFields = [
            'name',
            'description',
            'experience',
            'qualifications',
            'licences',
            'website',
            'service_radius_km',
        ];
        allowedFields.forEach((field) => {
            if (updates[field] !== undefined) {
                business[field] = updates[field];
            }
        });
        await this.businessRepository.save(business);
        return business;
    }
    async getServices(businessId) {
        return this.serviceRepository.find({
            where: { business_id: businessId },
            order: { created_at: 'ASC' },
        });
    }
    async addService(businessId, dto) {
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        const service = this.serviceRepository.create({
            business_id: businessId,
            service_name: dto.service_name,
            hourly_rate: dto.hourly_rate,
            description: dto.description,
        });
        await this.serviceRepository.save(service);
        return service;
    }
    async updateService(serviceId, businessId, dto) {
        const service = await this.serviceRepository.findOne({
            where: { id: serviceId, business_id: businessId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        service.service_name = dto.service_name;
        service.hourly_rate = dto.hourly_rate;
        service.description = dto.description;
        await this.serviceRepository.save(service);
        return service;
    }
    async deleteService(serviceId, businessId) {
        const service = await this.serviceRepository.findOne({
            where: { id: serviceId, business_id: businessId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        // Check if service has active bookings
        const activeBookings = await this.bookingRepository.findOne({
            where: {
                service_id: serviceId,
                status: booking_service_1.BookingStatus.CONFIRMED,
            },
        });
        if (activeBookings) {
            throw new common_1.BadRequestException('Cannot delete service with active bookings');
        }
        await this.serviceRepository.delete(serviceId);
    }
    async getBusinessHours(businessId) {
        return this.hoursRepository.find({
            where: { business_id: businessId },
            order: { day_of_week: 'ASC' },
        });
    }
    async updateBusinessHours(businessId, dto) {
        let hours = await this.hoursRepository.findOne({
            where: {
                business_id: businessId,
                day_of_week: dto.day_of_week,
            },
        });
        if (!hours) {
            hours = this.hoursRepository.create({
                business_id: businessId,
                day_of_week: dto.day_of_week,
            });
        }
        hours.open_time = dto.open_time;
        hours.close_time = dto.close_time;
        hours.is_available = dto.is_available;
        await this.hoursRepository.save(hours);
        return hours;
    }
    async getRecentBookings(businessId, limit = 10) {
        return this.bookingRepository.find({
            where: { business_id: businessId },
            relations: ['customer', 'service'],
            order: { scheduled_date: 'DESC' },
            take: limit,
        });
    }
    async getRevenueStats(businessId) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const [lastWeek, lastMonth, lastQuarter, allTime] = await Promise.all([
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
                created_at: (0, typeorm_2.Between)(weekAgo, now),
            }),
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
                created_at: (0, typeorm_2.Between)(monthAgo, now),
            }),
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
                created_at: (0, typeorm_2.Between)(quarterAgo, now),
            }),
            this.paymentRepository.sum('business_amount', {
                business_id: businessId,
                status: 'succeeded',
            }),
        ]);
        return {
            lastWeek: lastWeek || 0,
            lastMonth: lastMonth || 0,
            lastQuarter: lastQuarter || 0,
            allTime: allTime || 0,
        };
    }
    async getBookingStats(businessId) {
        const bookings = await this.bookingRepository.find({
            where: { business_id: businessId },
        });
        const byStatus = {
            pending: bookings.filter((b) => b.status === booking_service_1.BookingStatus.PENDING).length,
            confirmed: bookings.filter((b) => b.status === booking_service_1.BookingStatus.CONFIRMED)
                .length,
            completed: bookings.filter((b) => b.status === booking_service_1.BookingStatus.COMPLETED)
                .length,
            cancelled: bookings.filter((b) => b.status === booking_service_1.BookingStatus.CANCELLED)
                .length,
            noShow: bookings.filter((b) => b.status === booking_service_1.BookingStatus.NO_SHOW).length,
        };
        const byDay = {};
        bookings.forEach((b) => {
            const day = new Date(b.scheduled_date).toLocaleDateString('en-AU');
            byDay[day] = (byDay[day] || 0) + 1;
        });
        return { byStatus, byDay };
    }
};
exports.BusinessDashboardService = BusinessDashboardService;
exports.BusinessDashboardService = BusinessDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(business_service_entity_1.BusinessServiceEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHoursEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(booking_service_1.BookingEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessDashboardService);
//# sourceMappingURL=business-dashboard.service.js.map