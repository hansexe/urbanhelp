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
exports.BookingAcceptanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../../common/entities/booking.entity");
const twilio_service_1 = require("../notifications/twilio.service");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
let BookingAcceptanceService = class BookingAcceptanceService {
    constructor(bookingRepository, twilioService, sendGridService) {
        this.bookingRepository = bookingRepository;
        this.twilioService = twilioService;
        this.sendGridService = sendGridService;
    }
    async sendAcceptanceRequest(bookingId, businessId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId, business_id: businessId },
            relations: ['business', 'customer', 'service'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending bookings can be accepted');
        }
        // Generate acceptance link with token
        const acceptanceToken = this.generateAcceptanceToken(bookingId);
        const acceptLink = `https://urbanhelp.com.au/api/bookings/${bookingId}/accept?token=${acceptanceToken}`;
        const declineLink = `https://urbanhelp.com.au/api/bookings/${bookingId}/decline?token=${acceptanceToken}`;
        // Send SMS to business
        const message = `New booking request: ${booking.customer.user.first_name} ${booking.customer.user.last_name} for ${booking.service.service_name}. Accept: ${acceptLink} Decline: ${declineLink}`;
        await this.twilioService.sendSms(booking.business.user.phone_number, message);
        // Send email to business
        await this.sendGridService.sendBookingAcceptanceRequestEmail(booking.business.user.email, booking.business.name, booking.customer.user.first_name, booking.service.service_name, new Date(booking.scheduled_date), acceptLink, declineLink);
    }
    async acceptBooking(bookingId, businessId, token) {
        // Verify token
        if (!this.verifyAcceptanceToken(bookingId, token)) {
            throw new common_1.BadRequestException('Invalid or expired acceptance token');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId, business_id: businessId },
            relations: ['customer', 'business', 'service'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending bookings can be accepted');
        }
        // Update booking status to requires_payment
        booking.status = 'requires_payment';
        booking.payment_due_at = new Date();
        await this.bookingRepository.save(booking);
        // Send payment request to customer
        await this.sendPaymentRequest(booking);
        return booking;
    }
    async declineBooking(bookingId, businessId, token, reason) {
        // Verify token
        if (!this.verifyAcceptanceToken(bookingId, token)) {
            throw new common_1.BadRequestException('Invalid or expired acceptance token');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId, business_id: businessId },
            relations: ['customer', 'business', 'service'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending bookings can be declined');
        }
        // Update booking status to declined
        booking.status = 'declined';
        booking.cancellation_reason = reason || 'Business declined';
        booking.cancelled_at = new Date();
        await this.bookingRepository.save(booking);
        // Notify customer
        await this.sendGridService.sendBookingDeclinedEmail(booking.customer.user.email, booking.customer.user.first_name, booking.business.name, reason || 'Business declined this booking');
        await this.twilioService.sendBookingDeclinedSMS(booking.customer.user.phone_number, booking.business.name);
        return booking;
    }
    async sendPaymentRequest(booking) {
        const paymentLink = `https://urbanhelp.com.au/bookings/${booking.id}/payment`;
        // Send email to customer
        await this.sendGridService.sendPaymentRequestEmail(booking.customer.user.email, booking.customer.user.first_name, booking.business.name, booking.total_amount, new Date(booking.scheduled_date), paymentLink);
        // Send SMS to customer
        await this.twilioService.sendPaymentRequestSMS(booking.customer.user.phone_number, booking.business.name, booking.total_amount.toFixed(2), paymentLink);
    }
    generateAcceptanceToken(bookingId) {
        // Generate token valid for 24 hours
        const timestamp = Date.now();
        const expiryTime = timestamp + 24 * 60 * 60 * 1000;
        const data = `${bookingId}:${expiryTime}`;
        return Buffer.from(data).toString('base64');
    }
    verifyAcceptanceToken(bookingId, token) {
        try {
            const data = Buffer.from(token, 'base64').toString('utf-8');
            const [id, expiryTime] = data.split(':');
            if (id !== bookingId) {
                return false;
            }
            if (Date.now() > parseInt(expiryTime)) {
                return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.BookingAcceptanceService = BookingAcceptanceService;
exports.BookingAcceptanceService = BookingAcceptanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        twilio_service_1.TwilioService,
        sendgrid_service_1.SendGridService])
], BookingAcceptanceService);
//# sourceMappingURL=booking-acceptance.service.js.map