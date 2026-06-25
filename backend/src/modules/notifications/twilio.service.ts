import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken && accountSid.startsWith('AC')) {
      this.twilioClient = Twilio(accountSid, authToken);
    } else {
      console.warn('Twilio disabled');
      this.twilioClient = null;
    }
  }


  async sendBusinessRegistrationSMS(phoneNumber: string, businessName: string): Promise<void> {
    const message = `Welcome to Urban Help, ${businessName}! Your registration has been received. We'll review it within 24-48 hours. Check your email for updates.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendBusinessApprovalSMS(phoneNumber: string, businessName: string): Promise<void> {
    const message = `Great news! Your Urban Help business is approved and live! Start receiving booking requests now. Log in to your dashboard: urbanhelp.com.au`;
    await this.sendSms(phoneNumber, message);
  }

  async sendBusinessRejectionSMS(phoneNumber: string): Promise<void> {
    const message = `Urban Help: Your business application requires additional information. Please check your email for details. You can resubmit at any time.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendAdminApprovalNotificationSMS(phoneNumber: string, businessName: string): Promise<void> {
    const message = `Urban Help Admin: New business registration from ${businessName} awaiting approval.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendBookingNotification(
    businessPhone: string,
    customerName: string,
    serviceName: string,
  ): Promise<void> {
    const message = `New booking request from ${customerName} for ${serviceName}. Log in to your account to confirm or deny.`;
    await this.sendSms(businessPhone, message);
  }

  async sendBookingConfirmation(
    customerPhone: string,
    businessName: string,
  ): Promise<void> {
    const message = `Your booking with ${businessName} has been confirmed! Check your email for details. Reply STOP to opt-out.`;
    await this.sendSms(customerPhone, message);
  }

  async sendBookingReminderSMS(
    customerPhone: string,
    businessName: string,
    hoursUntilBooking: number,
  ): Promise<void> {
    const when =
      hoursUntilBooking <= 1
        ? 'in 1 hour'
        : `in ${hoursUntilBooking} hours`;
    const message = `Reminder: You have a booking with ${businessName} ${when}. Check your email for the address.`;
    await this.sendSms(customerPhone, message);
  }

  async sendBookingUpdateSMS(
    customerPhone: string,
    businessName: string,
    updateType: 'rescheduled' | 'cancelled' | 'confirmed',
  ): Promise<void> {
    const messages = {
      rescheduled: `${businessName} has rescheduled your booking. Check your email for the new time.`,
      cancelled: `Your booking with ${businessName} has been cancelled. Check your email for details.`,
      confirmed: `${businessName} confirmed your booking. Check your email for details.`,
    };
    await this.sendSms(customerPhone, messages[updateType]);
  }

  async sendBusinessBookingStats(
    businessPhone: string,
    pendingCount: number,
    confirmedCount: number,
  ): Promise<void> {
    const message = `Urban Help: You have ${pendingCount} pending booking request(s) and ${confirmedCount} confirmed booking(s). Log in to your dashboard.`;
    await this.sendSms(businessPhone, message);
  }

  async sendPaymentConfirmationSMS(
    customerPhone: string,
    amount: string,
    businessName: string,
  ): Promise<void> {
    const message = `Payment of ${amount} to ${businessName} confirmed via Urban Help. Receipt sent to your email.`;
    await this.sendSms(customerPhone, message);
  }

  async sendBookingDeclinedSMS(phoneNumber: string, reason?: string): Promise<void> {
    const message = reason
      ? `Urban Help: Unfortunately your booking was declined. Reason: ${reason}`
      : `Urban Help: Unfortunately your booking was declined. Please check your email for details.`;
    await this.sendSms(phoneNumber, message);
  }

  async sendPaymentRequestSMS(phoneNumber: string, amount: string, bookingId?: string): Promise<void> {
    const link = bookingId ? ` View: https://urbanhelp.com.au/bookings/${bookingId}` : '';
    const message = `Urban Help: A payment of ${amount} is requested for your booking.${link}`;
    await this.sendSms(phoneNumber, message);
  }

  async sendAccountLockedSMS(phoneNumber: string): Promise<void> {
    const message = 'Urban Help: Your account has been locked for security. It will unlock in 30 minutes.';
    await this.sendSms(phoneNumber, message);
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.twilioClient) {
      console.warn('Twilio not configured. SMS not sent:', { to, body });
      return;
    }

    const from = this.configService.get<string>('TWILIO_FROM_NUMBER');
    if (!from) {
      console.error('Twilio from number not configured.');
      return;
    }
    try {
      await this.twilioClient.messages.create({ to, from, body });
    } catch (error) {
      console.error('Failed to send SMS via Twilio:', error);
      throw error;
    }
  }

}
