// backend/src/notifications/twilio.service.ts - BOOKING SMS EXTENSIONS
// Add these methods to the existing TwilioService

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
