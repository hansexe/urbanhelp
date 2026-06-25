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
exports.CustomerDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const booking_entity_1 = require("../entities/booking.entity");
const payment_entity_1 = require("../entities/payment.entity");
const review_entity_1 = require("../entities/review.entity");
let CustomerDashboardService = class CustomerDashboardService {
    constructor(customerRepository, bookingRepository, paymentRepository, reviewRepository) {
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
    }
    async getDashboardOverview(customerId) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const now = new Date();
        const [totalBookings, upcomingBookings, completedBookings, totalSpent, totalRefunded, totalReviews,] = await Promise.all([
            this.bookingRepository.countBy({ customer_id: customerId }),
            this.bookingRepository.countBy({
                customer_id: customerId,
                scheduled_date: (0, typeorm_2.Between)(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
                status: 'confirmed',
            }),
            this.bookingRepository.countBy({
                customer_id: customerId,
                status: 'completed',
            }),
            this.paymentRepository.sum('amount', {
                customer_id: customerId,
                payment_type: 'booking',
                status: 'succeeded',
            }),
            this.paymentRepository.sum('amount', {
                customer_id: customerId,
                payment_type: 'refund',
                status: 'succeeded',
            }),
            this.reviewRepository.countBy({ customer_id: customerId }),
        ]);
        return {
            totalBookings,
            upcomingBookings,
            completedBookings,
            totalSpent: totalSpent || 0,
            averageRating: customer.average_rating || 0,
            totalReviewsGiven: totalReviews,
            savingsFromRefunds: totalRefunded || 0,
        };
    }
    async getUpcomingBookings(customerId, limit = 5) {
        const now = new Date();
        return this.bookingRepository.find({
            where: {
                customer_id: customerId,
                scheduled_date: (0, typeorm_2.Between)(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
                status: 'confirmed',
            },
            relations: ['business', 'service'],
            order: { scheduled_date: 'ASC' },
            take: limit,
        });
    }
    async getBookingHistory(customerId) {
        return this.bookingRepository.find({
            where: { customer_id: customerId },
            relations: ['business', 'service'],
            order: { created_at: 'DESC' },
        });
    }
    async getPaymentHistory(customerId) {
        return this.paymentRepository.find({
            where: { customer_id: customerId },
            order: { created_at: 'DESC' },
        });
    }
    async getReviewHistory(customerId) {
        return this.reviewRepository.find({
            where: { customer_id: customerId },
            relations: ['business'],
            order: { created_at: 'DESC' },
        });
    }
    async getFavoriteBusinesses(customerId) {
        const bookings = await this.bookingRepository.find({
            where: { customer_id: customerId, status: 'completed' },
            relations: ['business'],
        });
        const businessCounts = new Map();
        bookings.forEach((booking) => {
            const count = businessCounts.get(booking.business_id) || 0;
            businessCounts.set(booking.business_id, count + 1);
        });
        // Get top 5 businesses
        const sortedBusinesses = Array.from(businessCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        return sortedBusinesses.map(([businessId, count]) => ({
            businessId,
            bookingCount: count,
        }));
    }
    async saveAddress(customerId, address) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const savedAddresses = customer.saved_addresses || [];
        if (!savedAddresses.includes(address)) {
            savedAddresses.push(address);
            await this.customerRepository.update({ id: customerId }, { saved_addresses: savedAddresses });
        }
    }
    async getSavedAddresses(customerId) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return customer.saved_addresses || [];
    }
    async deleteAddress(customerId, address) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const savedAddresses = (customer.saved_addresses || []).filter((a) => a !== address);
        await this.customerRepository.update({ id: customerId }, { saved_addresses: savedAddresses });
    }
    async updatePreferences(customerId, preferences) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const updates = {};
        if (preferences.notificationsEnabled !== undefined) {
            updates.notifications_enabled = preferences.notificationsEnabled;
        }
        if (preferences.smsNotifications !== undefined) {
            updates.sms_notifications = preferences.smsNotifications;
        }
        if (preferences.emailNotifications !== undefined) {
            updates.email_notifications = preferences.emailNotifications;
        }
        if (preferences.preferredPaymentMethod !== undefined) {
            updates.preferred_payment_method = preferences.preferredPaymentMethod;
        }
        await this.customerRepository.update({ id: customerId }, updates);
    }
    async getMonthlySpending(customerId) {
        const payments = await this.paymentRepository.find({
            where: {
                customer_id: customerId,
                payment_type: 'booking',
                status: 'succeeded',
            },
        });
        const monthlySpending = {};
        payments.forEach((payment) => {
            const date = new Date(payment.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + payment.amount;
        });
        return monthlySpending;
    }
    async getAverageRating(customerId) {
        const reviews = await this.reviewRepository.find({
            where: { customer_id: customerId },
        });
        if (reviews.length === 0)
            return 0;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return Math.round((totalRating / reviews.length) * 10) / 10;
    }
};
exports.CustomerDashboardService = CustomerDashboardService;
exports.CustomerDashboardService = CustomerDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(review_entity_1.ReviewEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerDashboardService);
//# sourceMappingURL=customer-dashboard.service.js.map