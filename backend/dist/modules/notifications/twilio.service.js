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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = __importDefault(require("twilio"));
const config_1 = require("@nestjs/config");
let TwilioService = class TwilioService {
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (accountSid && authToken && accountSid.startsWith('AC')) {
            this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
        }
        else {
            console.warn('Twilio disabled');
            this.twilioClient = null;
        }
    }
    async sendBusinessRegistrationSMS(phoneNumber, businessName) {
        const message = `Welcome to Urban Help, ${businessName}! Your registration has been received. We'll review it within 24-48 hours. Check your email for updates.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendBusinessApprovalSMS(phoneNumber, businessName) {
        const message = `Great news! Your Urban Help business is approved and live! Start receiving booking requests now. Log in to your dashboard: urbanhelp.com.au`;
        await this.sendSms(phoneNumber, message);
    }
    async sendBusinessRejectionSMS(phoneNumber) {
        const message = `Urban Help: Your business application requires additional information. Please check your email for details. You can resubmit at any time.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendAdminApprovalNotificationSMS(phoneNumber, businessName) {
        const message = `Urban Help Admin: New business registration from ${businessName} awaiting approval.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendBookingNotification(businessPhone, customerName, serviceName) {
        const message = `New booking request from ${customerName} for ${serviceName}. Log in to your account to confirm or deny.`;
        await this.sendSms(businessPhone, message);
    }
    async sendBookingConfirmation(customerPhone, businessName) {
        const message = `Your booking with ${businessName} has been confirmed! Check your email for details. Reply STOP to opt-out.`;
        await this.sendSms(customerPhone, message);
    }
    async sendBookingReminderSMS(customerPhone, businessName, hoursUntilBooking) {
        const when = hoursUntilBooking <= 1
            ? 'in 1 hour'
            : `in ${hoursUntilBooking} hours`;
        const message = `Reminder: You have a booking with ${businessName} ${when}. Check your email for the address.`;
        await this.sendSms(customerPhone, message);
    }
    async sendBookingUpdateSMS(customerPhone, businessName, updateType) {
        const messages = {
            rescheduled: `${businessName} has rescheduled your booking. Check your email for the new time.`,
            cancelled: `Your booking with ${businessName} has been cancelled. Check your email for details.`,
            confirmed: `${businessName} confirmed your booking. Check your email for details.`,
        };
        await this.sendSms(customerPhone, messages[updateType]);
    }
    async sendBusinessBookingStats(businessPhone, pendingCount, confirmedCount) {
        const message = `Urban Help: You have ${pendingCount} pending booking request(s) and ${confirmedCount} confirmed booking(s). Log in to your dashboard.`;
        await this.sendSms(businessPhone, message);
    }
    async sendPaymentConfirmationSMS(customerPhone, amount, businessName) {
        const message = `Payment of ${amount} to ${businessName} confirmed via Urban Help. Receipt sent to your email.`;
        await this.sendSms(customerPhone, message);
    }
    async sendBookingDeclinedSMS(phoneNumber, reason) {
        const message = reason
            ? `Urban Help: Unfortunately your booking was declined. Reason: ${reason}`
            : `Urban Help: Unfortunately your booking was declined. Please check your email for details.`;
        await this.sendSms(phoneNumber, message);
    }
    async sendPaymentRequestSMS(phoneNumber, amount, bookingId) {
        const link = bookingId ? ` View: https://urbanhelp.com.au/bookings/${bookingId}` : '';
        const message = `Urban Help: A payment of ${amount} is requested for your booking.${link}`;
        await this.sendSms(phoneNumber, message);
    }
    async sendAccountLockedSMS(phoneNumber) {
        const message = 'Urban Help: Your account has been locked for security. It will unlock in 30 minutes.';
        await this.sendSms(phoneNumber, message);
    }
    async sendSms(to, body) {
        if (!this.twilioClient) {
            console.warn('Twilio not configured. SMS not sent:', { to, body });
            return;
        }
        const from = this.configService.get('TWILIO_FROM_NUMBER');
        if (!from) {
            console.error('Twilio from number not configured.');
            return;
        }
        try {
            await this.twilioClient.messages.create({ to, from, body });
        }
        catch (error) {
            console.error('Failed to send SMS via Twilio:', error);
            throw error;
        }
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map