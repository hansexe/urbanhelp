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
const booking_entity_1 = require("../../common/entities/booking.entity");
const business_entity_1 = require("../../common/entities/business.entity");
const customer_entity_1 = require("../../common/entities/customer.entity");
const business_hours_entity_1 = require("../../common/entities/business-hours.entity");
const payment_entity_1 = require("../../common/entities/payment.entity");
const twilio_service_1 = require("../notifications/twilio.service");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
/**
 * Valid Status Transitions
 *
 * PENDING → CONFIRMED (customer updates, business confirms)
 * PENDING → CANCELLED (customer or business cancels)
 * CONFIRMED → COMPLETED (business marks complete)
 * CONFIRMED → NO_SHOW (business marks no-show)
 * CONFIRMED → CANCELLED (business cancels with refund)
 * COMPLETED → NONE (terminal state)
 * CANCELLED → NONE (terminal state)
 * NO_SHOW → NONE (terminal state)
 */
const VALID_TRANSITIONS = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.NO_SHOW, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.NO_SHOW]: [],
};
let BookingsService = class BookingsService {
    constructor(bookingRepository, businessRepository, customerRepository, businessHoursRepository, paymentRepository, dataSource, twilioService, sendGridService) {
        this.bookingRepository = bookingRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.paymentRepository = paymentRepository;
        this.dataSource = dataSource;
        this.twilioService = twilioService;
        this.sendGridService = sendGridService;
    }
    /**
     * Helper: Validate status transition is allowed
     * @throws BadRequestException if transition is invalid
     */
    validateStatusTransition(currentStatus, targetStatus) {
        const allowedTransitions = VALID_TRANSITIONS[currentStatus];
        if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
            throw new common_1.BadRequestException(`Cannot transition booking from ${currentStatus} to ${targetStatus}. ` +
                `Allowed transitions: ${allowedTransitions?.join(', ') || 'none (terminal state)'}`);
        }
    }
    /**
     * Helper: Check if business is open on requested date/time
     * @throws BadRequestException if booking outside business hours
     */
    async validateBusinessHours(businessId, scheduledDate, durationHours) {
        // Get business hours for the day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = scheduledDate.getDay();
        const businessHours = await this.businessHoursRepository.findOne({
            where: {
                business_id: businessId,
                day_of_week: dayOfWeek,
            },
        });
        if (!businessHours) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            throw new common_1.BadRequestException(`Business is not available on ${dayNames[dayOfWeek]}s`);
        }
        // Parse time strings (format: "HH:MM")
        const schedHour = scheduledDate.getHours();
        const schedMin = scheduledDate.getMinutes();
        const [openHour, openMin] = businessHours.start_time.split(':').map(Number);
        const [closeHour, closeMin] = businessHours.end_time.split(':').map(Number);
        const schedTimeInMinutes = schedHour * 60 + schedMin;
        const openTimeInMinutes = openHour * 60 + openMin;
        const closeTimeInMinutes = closeHour * 60 + closeMin;
        const bookingEndTimeInMinutes = schedTimeInMinutes + (durationHours * 60);
        // Validate booking starts during business hours
        if (schedTimeInMinutes < openTimeInMinutes) {
            throw new common_1.BadRequestException(`Booking starts before business hours (opens at ${businessHours.start_time})`);
        }
        // Validate booking ends before close time
        if (bookingEndTimeInMinutes > closeTimeInMinutes) {
            throw new common_1.BadRequestException(`Booking extends past business hours (closes at ${businessHours.end_time})`);
        }
    }
    /**
     * Helper: Check for schedule conflicts with existing bookings
     * Checks both PENDING and CONFIRMED bookings to prevent double-booking
     * @throws ConflictException if overlapping booking found
     */
    async validateNoScheduleConflict(businessId, scheduledDate, durationHours, excludeBookingId) {
        const bookingStart = new Date(scheduledDate);
        const bookingEnd = new Date(scheduledDate.getTime() + durationHours * 60 * 60 * 1000);
        // Query for any overlapping PENDING or CONFIRMED bookings
        const conflictingBooking = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.business_id = :businessId', { businessId })
            .andWhere('booking.status IN (:...statuses)', {
            statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        })
            .andWhere('booking.appointment_date < :bookingEnd', { bookingEnd })
            .andWhere('DATE_ADD(booking.appointment_date, INTERVAL booking.duration_hours HOUR) > :bookingStart', { bookingStart })
            .andWhere(excludeBookingId ? 'booking.id != :excludeId' : '1=1', { excludeId: excludeBookingId })
            .getOne();
        if (conflictingBooking) {
            throw new common_1.ConflictException('Business has a conflicting booking at this time. Please select a different time slot.');
        }
    }
    async createBooking(dto) {
        // VALIDATION: Business exists and is approved
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
        // VALIDATION: Customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: dto.customerId },
            relations: ['user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        // VALIDATION: Service belongs to business
        const service = business.services.find((s) => s.id === dto.serviceId);
        if (!service) {
            throw new common_1.BadRequestException('Service not found for this business');
        }
        // VALIDATION: Booking is in the future
        if (new Date(dto.scheduledDate) < new Date()) {
            throw new common_1.BadRequestException('Cannot book in the past');
        }
        // VALIDATION: Booking duration is reasonable (1-24 hours)
        if (dto.duration_hours < 1 || dto.duration_hours > 24) {
            throw new common_1.BadRequestException('Booking duration must be between 1 and 24 hours');
        }
        // VALIDATION: Check business is open at requested time
        await this.validateBusinessHours(dto.businessId, dto.scheduledDate, dto.duration_hours);
        // VALIDATION: No schedule conflicts (checks both PENDING and CONFIRMED)
        await this.validateNoScheduleConflict(dto.businessId, dto.scheduledDate, dto.duration_hours);
        // Calculate total amount
        const totalAmount = service.hourly_rate * dto.duration_hours;
        // CREATE BOOKING: All fields ready
        const booking = this.bookingRepository.create({
            business_id: dto.businessId,
            customer_id: dto.customerId,
            service_id: dto.serviceId,
            appointment_date: new Date(dto.scheduledDate),
            duration_hours: dto.duration_hours,
            customer_address: dto.location,
            business_notes: dto.notes,
            status: BookingStatus.PENDING,
            total_amount: totalAmount,
            commission_amount: totalAmount * 0.1,
            business_amount: totalAmount * 0.9,
        });
        await this.bookingRepository.save(booking);
        // NOTIFICATIONS: Send async (non-blocking)
        try {
            if (business.user.phone_number) {
                await this.twilioService.sendBookingNotification(business.user.phone_number, customer.user.first_name, service.service_name);
            }
            await this.sendGridService.sendBookingConfirmationEmail(customer.user.email, customer.user.first_name, business.name, new Date(dto.scheduledDate), booking.id);
        }
        catch (error) {
            console.error('Failed to send booking notifications:', error);
            // Don't fail booking if notifications fail
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
        // AUTHORIZATION: Only customer can update their booking
        if (booking.customer_id !== customerId) {
            throw new common_1.ForbiddenException('You do not have permission to update this booking');
        }
        // STATUS VALIDATION: Only PENDING bookings can be updated
        if (booking.status !== BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Can only update pending bookings. Current status: ' + booking.status);
        }
        // IMMUTABLE FIELD PROTECTION: Prevent status changes via update
        if (dto.status !== undefined) {
            throw new common_1.ForbiddenException('Cannot modify booking status via update. Use specific confirmation/cancellation endpoints.');
        }
        // UPDATE: Scheduled date
        if (dto.scheduledDate) {
            if (new Date(dto.scheduledDate) < new Date()) {
                throw new common_1.BadRequestException('Cannot reschedule to the past');
            }
            // Re-validate business hours for new time
            await this.validateBusinessHours(booking.business_id, dto.scheduledDate, dto.duration_hours || booking.duration_hours);
            // Re-validate no conflicts
            await this.validateNoScheduleConflict(booking.business_id, dto.scheduledDate, dto.duration_hours || booking.duration_hours, bookingId);
            booking.appointment_date = new Date(dto.scheduledDate);
        }
        // UPDATE: Duration
        if (dto.duration_hours) {
            if (dto.duration_hours < 1 || dto.duration_hours > 24) {
                throw new common_1.BadRequestException('Duration must be between 1 and 24 hours');
            }
            // Re-validate business hours with new duration
            await this.validateBusinessHours(booking.business_id, booking.appointment_date, dto.duration_hours);
            // Re-validate no conflicts with new duration
            await this.validateNoScheduleConflict(booking.business_id, booking.appointment_date, dto.duration_hours, bookingId);
            booking.duration_hours = dto.duration_hours;
            // Recalculate amounts
            booking.total_amount = booking.service.hourly_rate * dto.duration_hours;
            booking.commission_amount = booking.total_amount * 0.1;
            booking.business_amount = booking.total_amount * 0.9;
        }
        // UPDATE: Location
        if (dto.location) {
            booking.customer_address = dto.location;
        }
        // UPDATE: Notes
        if (dto.notes !== undefined) {
            booking.business_notes = dto.notes;
        }
        await this.bookingRepository.save(booking);
        return booking;
    }
    async confirmBooking(bookingId, businessId) {
        const booking = await this.getBookingById(bookingId);
        // AUTHORIZATION: Only business owner can confirm their bookings
        if (booking.business_id !== businessId) {
            throw new common_1.ForbiddenException('You do not have permission to confirm this booking');
        }
        // STATUS TRANSITION: Validate PENDING → CONFIRMED is allowed
        this.validateStatusTransition(booking.status, BookingStatus.CONFIRMED);
        booking.status = BookingStatus.CONFIRMED;
        booking.confirmed_at = new Date();
        await this.bookingRepository.save(booking);
        // NOTIFICATIONS: Send confirmation (non-blocking)
        try {
            await this.sendGridService.sendBookingConfirmationEmail(booking.customer.user.email, booking.customer.user.first_name, booking.business.name, booking.appointment_date, booking.id);
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
        // AUTHORIZATION: Verify user owns this booking
        if ((userRole === 'customer' && booking.customer_id !== userId) ||
            (userRole === 'business' && booking.business_id !== userId)) {
            throw new common_1.ForbiddenException('You do not have permission to cancel this booking');
        }
        // STATUS VALIDATION: Can only cancel PENDING or CONFIRMED
        if (booking.status === BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('This booking is already cancelled');
        }
        if (booking.status === BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed booking');
        }
        if (booking.status === BookingStatus.NO_SHOW) {
            throw new common_1.BadRequestException('Cannot cancel a no-show booking');
        }
        // STATUS TRANSITION: Validate allowed transition
        this.validateStatusTransition(booking.status, BookingStatus.CANCELLED);
        // CALCULATE REFUND: 100% if >24h, 50% if <=24h
        const hoursTillBooking = Math.floor((booking.appointment_date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
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
                // Create refund record (marked as pending until Stripe processes)
                const refund = this.paymentRepository.create({
                    booking_id: bookingId,
                    business_id: booking.business_id,
                    customer_id: booking.customer_id,
                    amount: refundAmount,
                    payment_type: 'refund',
                    status: 'pending', // Will be updated by Stripe webhook
                    stripe_payment_id: `refund_${payment.stripe_payment_id}`,
                });
                await this.paymentRepository.save(refund);
            }
        }
        // NOTIFICATIONS: Send cancellation notification (non-blocking)
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
            throw new common_1.ForbiddenException('You do not have permission to complete this booking');
        }
        this.validateStatusTransition(booking.status, BookingStatus.COMPLETED);
        booking.status = BookingStatus.COMPLETED;
        booking.completed_at = new Date();
        await this.bookingRepository.save(booking);
        // NOTIFICATIONS: Request review from customer (non-blocking)
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
            throw new common_1.ForbiddenException('You do not have permission to mark this booking as no-show');
        }
        this.validateStatusTransition(booking.status, BookingStatus.NO_SHOW);
        booking.status = BookingStatus.NO_SHOW;
        await this.bookingRepository.save(booking);
        // NOTIFICATIONS: Send no-show notification (non-blocking)
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
    __param(3, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHoursEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        twilio_service_1.TwilioService,
        sendgrid_service_1.SendGridService])
], BookingsService);
//# sourceMappingURL=booking.service.js.map