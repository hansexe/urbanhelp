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
exports.BookingsService = exports.BookingStatus = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../entities/booking.entity");
const business_entity_1 = require("../entities/business.entity");
const customer_entity_1 = require("../entities/customer.entity");
const payment_entity_1 = require("../entities/payment.entity");
const twilio_service_1 = require("../modules/notifications/twilio.service");
const sendgrid_service_1 = require("../modules/notifications/sendgrid.service");
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
let BookingsService = class BookingsService {
    constructor(bookingRepository, businessRepository, customerRepository, paymentRepository, twilioService, sendGridService) {
        this.bookingRepository = bookingRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.twilioService = twilioService;
        this.sendGridService = sendGridService;
    }
    async createBooking(dto) {
        // Validate business exists and is approved
        const business = await this.businessRepository.findOne({
            where: { id: dto.businessId },
            relations: ['user', 'services'],
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (business.approval_status !== 'approved') {
            throw new common_1.BadRequestException('Business is not approved for bookings');
        }
        // Validate customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: dto.customerId },
            relations: ['user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        // Validate service belongs to business
        const service = business.services.find((s) => s.id === dto.serviceId);
        if (!service) {
            throw new common_1.BadRequestException('Service not found for this business');
        }
        // Check for time conflicts
        const conflictingBooking = await this.bookingRepository.findOne({
            where: {
                business_id: dto.businessId,
                scheduled_date: (0, typeorm_2.Between)(new Date(dto.scheduledDate.getTime() - dto.duration_hours * 60 * 60 * 1000), new Date(dto.scheduledDate.getTime() + dto.duration_hours * 60 * 60 * 1000)),
                status: BookingStatus.CONFIRMED,
            },
        });
        if (conflictingBooking) {
            throw new common_1.ConflictException('Business has a booking at this time');
        }
        // Validate booking is in the future
        if (new Date(dto.scheduledDate) < new Date()) {
            throw new common_1.BadRequestException('Cannot book in the past');
        }
        // Calculate total amount
        const totalAmount = service.hourly_rate * dto.duration_hours;
        // Create booking
        const booking = this.bookingRepository.create({
            business_id: dto.businessId,
            customer_id: dto.customerId,
            service_id: dto.serviceId,
            scheduled_date: new Date(dto.scheduledDate),
            duration_hours: dto.duration_hours,
            location: dto.location,
            notes: dto.notes,
            status: BookingStatus.PENDING,
            total_amount: totalAmount,
            commission_amount: totalAmount * 0.1,
            business_amount: totalAmount * 0.9,
        });
        await this.bookingRepository.save(booking);
        // Send notifications
        try {
            if (business.user.phone_number) {
                await this.twilioService.sendBookingNotification(business.user.phone_number, customer.user.first_name, service.service_name);
            }
            await this.sendGridService.sendBookingConfirmationEmail(customer.user.email, customer.user.first_name, business.name, new Date(dto.scheduledDate), booking.id);
        }
        catch (error) {
            console.error('Failed to send booking notifications:', error);
        }
        return booking;
    }
    async getBookingById(bookingId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['business', 'customer', 'service'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async getCustomerBookings(customerId) {
        return this.bookingRepository.find({
            where: { customer_id: customerId },
            relations: ['business', 'service'],
            order: { scheduled_date: 'DESC' },
        });
    }
    async getBusinessBookings(businessId) {
        return this.bookingRepository.find({
            where: { business_id: businessId },
            relations: ['customer', 'service'],
            order: { scheduled_date: 'DESC' },
        });
    }
    async getBusinessBookingsForDate(businessId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.bookingRepository.find({
            where: {
                business_id: businessId,
                scheduled_date: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: BookingStatus.CONFIRMED,
            },
            relations: ['customer', 'service'],
            order: { scheduled_date: 'ASC' },
        });
    }
    async updateBooking(bookingId, customerId, dto) {
        const booking = await this.getBookingById(bookingId);
        // Only customer can update their booking, and only if pending
        if (booking.customer_id !== customerId) {
            throw new common_1.BadRequestException('Not authorized to update this booking');
        }
        if (booking.status !== BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Can only update pending bookings');
        }
        // Update allowed fields
        if (dto.scheduledDate) {
            if (new Date(dto.scheduledDate) < new Date()) {
                throw new common_1.BadRequestException('Cannot reschedule to the past');
            }
            booking.scheduled_date = new Date(dto.scheduledDate);
        }
        if (dto.duration_hours) {
            booking.duration_hours = dto.duration_hours;
            // Recalculate amounts
            booking.total_amount = booking.service.hourly_rate * dto.duration_hours;
            booking.commission_amount = booking.total_amount * 0.1;
            booking.business_amount = booking.total_amount * 0.9;
        }
        if (dto.location) {
            booking.location = dto.location;
        }
        if (dto.notes !== undefined) {
            booking.notes = dto.notes;
        }
        await this.bookingRepository.save(booking);
        return booking;
    }
    async confirmBooking(bookingId, businessId) {
        const booking = await this.getBookingById(bookingId);
        // Only business can confirm booking
        if (booking.business_id !== businessId) {
            throw new common_1.BadRequestException('Not authorized to confirm this booking');
        }
        if (booking.status !== BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Can only confirm pending bookings');
        }
        booking.status = BookingStatus.CONFIRMED;
        booking.confirmed_at = new Date();
        await this.bookingRepository.save(booking);
        // Send confirmation notifications
        try {
            await this.sendGridService.sendBookingConfirmationEmail(booking.customer.user.email, booking.customer.user.first_name, booking.business.name, booking.scheduled_date, booking.id);
            if (booking.customer.user.phone_number) {
                await this.twilioService.sendBookingConfirmation(booking.customer.user.phone_number, booking.business.name);
            }
        }
        catch (error) {
            console.error('Failed to send confirmation notifications:', error);
        }
        return booking;
    }
    async cancelBooking(bookingId, userId, dto, userRole) {
        const booking = await this.getBookingById(bookingId);
        // Authorization check
        if ((userRole === 'customer' && booking.customer_id !== userId) ||
            (userRole === 'business' && booking.business_id !== userId)) {
            throw new common_1.BadRequestException('Not authorized to cancel this booking');
        }
        if (booking.status === BookingStatus.CANCELLED ||
            booking.status === BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel this booking');
        }
        // Calculate cancellation fee (50% if within 24 hours)
        const hoursTillBooking = Math.floor((booking.scheduled_date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        const refundAmount = hoursTillBooking < 24
            ? booking.total_amount * 0.5
            : booking.total_amount;
        booking.status = BookingStatus.CANCELLED;
        booking.cancelled_at = new Date();
        booking.cancellation_reason = dto.reason;
        booking.refund_amount = refundAmount;
        await this.bookingRepository.save(booking);
        // Process refund if payment was made
        if (refundAmount > 0) {
            const payment = await this.paymentRepository.findOne({
                where: { booking_id: bookingId },
                order: { created_at: 'DESC' },
            });
            if (payment && payment.status === 'succeeded') {
                // Create refund record
                const refund = this.paymentRepository.create({
                    booking_id: bookingId,
                    business_id: booking.business_id,
                    customer_id: booking.customer_id,
                    amount: refundAmount,
                    payment_type: 'refund',
                    status: 'succeeded',
                    stripe_payment_id: `refund_${payment.stripe_payment_id}`,
                });
                await this.paymentRepository.save(refund);
            }
        }
        // Send cancellation notifications
        try {
            await this.sendGridService.sendBookingCancellationEmail(booking.customer.user.email, booking.business.name, dto.reason, refundAmount);
        }
        catch (error) {
            console.error('Failed to send cancellation notifications:', error);
        }
        return booking;
    }
    async completeBooking(bookingId, businessId) {
        const booking = await this.getBookingById(bookingId);
        if (booking.business_id !== businessId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can be completed');
        }
        booking.status = BookingStatus.COMPLETED;
        booking.completed_at = new Date();
        await this.bookingRepository.save(booking);
        // Send completion notification asking for review
        try {
            await this.sendGridService.sendRequestReviewEmail(booking.customer.user.email, booking.customer.user.first_name, booking.business.name, booking.id);
        }
        catch (error) {
            console.error('Failed to send review request:', error);
        }
        return booking;
    }
    async markNoShow(bookingId, businessId) {
        const booking = await this.getBookingById(bookingId);
        if (booking.business_id !== businessId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can be marked no-show');
        }
        booking.status = BookingStatus.NO_SHOW;
        await this.bookingRepository.save(booking);
        // Send no-show notification
        try {
            await this.sendGridService.sendBookingNoShowEmail(booking.customer.user.email, booking.business.name);
        }
        catch (error) {
            console.error('Failed to send no-show notification:', error);
        }
        return booking;
    }
    async getBookingStats(businessId) {
        const [total, pending, confirmed, completed, cancelled, noShow] = await Promise.all([
            this.bookingRepository.countBy({ business_id: businessId }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: BookingStatus.PENDING,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: BookingStatus.CONFIRMED,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: BookingStatus.COMPLETED,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: BookingStatus.CANCELLED,
            }),
            this.bookingRepository.countBy({
                business_id: businessId,
                status: BookingStatus.NO_SHOW,
            }),
        ]);
        return { total, pending, confirmed, completed, cancelled, noShow };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        twilio_service_1.TwilioService,
        sendgrid_service_1.SendGridService])
], BookingsService);
//# sourceMappingURL=booking.service.js.map