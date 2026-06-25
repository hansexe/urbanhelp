import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

// Backward-compatible helper for callers that still reference the old function signature.
function sendgridConfig(configService?: ConfigService) {
  const cfg = configService || new ConfigService();
  return {
    apiKey: cfg.get<string>('SENDGRID_API_KEY'),
    fromEmail: cfg.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@urbanhelp.com.au',
  };
}

@Injectable()
export class SendGridService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (apiKey && !apiKey.includes('your_sendgrid_api_key')) {
      sgMail.setApiKey(apiKey);
    } else {
      console.log('SendGrid disabled');
    }
  }

  private getFromEmail(): string {
    return this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@urbanhelp.com.au';
  }


  async sendBusinessRegistrationEmail(businessEmail: string, businessName: string): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Business Registration Received</h2>
        <p>Hi ${businessName},</p>
        <p>Thank you for registering with Urban Help. We've received your application and will review it within 24-48 hours.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>What happens next:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Our team verifies your ABN and business details</li>
            <li>We confirm your qualifications and licences</li>
            <li>You'll receive approval or need to provide additional information</li>
            <li>Once approved, you'll be visible to customers in Urban Help</li>
          </ul>
        </div>
        <p>You can check your approval status by logging into your account.</p>
        <p>If you have any questions, please contact us at support@urbanhelp.com.au</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: 'Urban Help - Business Registration Received',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send business registration email:', error);
      throw error;
    }
  }

  async sendBusinessApprovalEmail(businessEmail: string, businessName: string): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Urban Help!</h2>
        <p>Hi ${businessName},</p>
        <p>Great news! Your business has been approved and is now live on Urban Help.</p>
        <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>You're now visible to customers searching for your services.</strong></p>
        </div>
        <p><strong>Next steps:</strong></p>
        <ul style="margin: 10px 0;">
          <li>Complete your Stripe Connect setup for payments</li>
          <li>Add more photos to your profile</li>
          <li>Start receiving customer booking requests</li>
        </ul>
        <p><a href="https://urbanhelp.com.au/business/dashboard" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Your Dashboard</a></p>
        <p>If you have any questions, contact support@urbanhelp.com.au</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: 'Urban Help - Your Business is Approved!',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send approval email:', error);
      throw error;
    }
  }

  async sendBusinessRejectionEmail(
    businessEmail: string,
    businessName: string,
    rejectionReason: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Update</h2>
        <p>Hi ${businessName},</p>
        <p>Thank you for applying to Urban Help. Unfortunately, your application could not be approved at this time.</p>
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reason:</strong></p>
          <p>${rejectionReason}</p>
        </div>
        <p><strong>What you can do:</strong></p>
        <ul style="margin: 10px 0;">
          <li>Address the issues mentioned above</li>
          <li>Update your application with additional information</li>
          <li>Resubmit your application</li>
        </ul>
        <p>If you believe this is an error or have questions, please contact us at support@urbanhelp.com.au</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: 'Urban Help - Application Update Required',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      throw error;
    }
  }

  async sendAdminApprovalNotification(
    adminEmail: string,
    businessName: string,
    businessId: string,
    abn: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const approvalLink = `https://urbanhelp.com.au/admin/approvals/${businessId}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Business Registration to Review</h2>
        <p>A new business has registered and requires approval.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>ABN:</strong> ${abn}</p>
          <p><strong>Registration ID:</strong> ${businessId}</p>
        </div>
        <p><a href="${approvalLink}" style="display: inline-block; background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Application</a></p>
      </div>
    `;

    try {
      await sgMail.send({
        to: adminEmail,
        from: config.fromEmail,
        subject: 'Urban Help Admin - New Business Registration',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      throw error;
    }
  }

  async sendBookingConfirmationEmail(
    customerEmail: string,
    customerName: string,
    businessName: string,
    scheduledDate: Date,
    bookingId: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const formattedDate = scheduledDate.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Request Received</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking request with <strong>${businessName}</strong> has been received.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Business:</strong> ${businessName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Booking Reference:</strong> ${bookingId}</p>
        </div>
        <p>The business will confirm your booking shortly. You'll receive an SMS and email once they confirm.</p>
        <p><a href="https://urbanhelp.com.au/bookings/${bookingId}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking</a></p>
        <p>If you need to cancel, you can do so from your account dashboard.</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Booking Request Confirmation`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw error;
    }
  }

  async sendBookingConfirmedEmail(
    customerEmail: string,
    customerName: string,
    businessName: string,
    businessPhone: string,
    scheduledDate: Date,
    location: string,
    bookingId: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const formattedDate = scheduledDate.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E8F5E9;">Booking Confirmed! ✓</h2>
        <p>Hi ${customerName},</p>
        <p>Your booking with <strong>${businessName}</strong> has been confirmed.</p>
        <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Confirmed Booking Details</h3>
          <p><strong>Business:</strong> ${businessName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Contact:</strong> ${businessPhone}</p>
        </div>
        <p><strong>What to expect:</strong></p>
        <ul style="margin: 10px 0;">
          <li>The business will arrive at the scheduled time</li>
          <li>Arrive early if possible to let them in</li>
          <li>Have any access codes or keys ready</li>
        </ul>
        <p><a href="https://urbanhelp.com.au/bookings/${bookingId}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking Details</a></p>
        <p>If anything changes, contact the business directly or reschedule through your account.</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Booking Confirmed`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send booking confirmed email:', error);
      throw error;
    }
  }

  async sendBookingCancellationEmail(
    customerEmail: string,
    businessName: string,
    reason: string,
    refundAmount: number,
  ): Promise<void> {
    const config = sendgridConfig();
    const formattedRefund = `$${refundAmount.toFixed(2)}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Cancelled</h2>
        <p>Your booking with <strong>${businessName}</strong> has been cancelled.</p>
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cancellation Reason:</strong> ${reason}</p>
          ${
            refundAmount > 0
              ? `<p><strong>Refund Amount:</strong> ${formattedRefund}</p>`
              : '<p><strong>No refund:</strong> Cancellation was made within 24 hours of booking.</p>'
          }
        </div>
        <p>${
          refundAmount > 0
            ? 'Your refund will be processed to your original payment method within 3-5 business days.'
            : 'As per the cancellation policy, no refund is available for cancellations within 24 hours.'
        }</p>
        <p><a href="https://urbanhelp.com.au/search" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find Another Service</a></p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Booking Cancelled`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      throw error;
    }
  }

  async sendRequestReviewEmail(
    customerEmail: string,
    customerName: string,
    businessName: string,
    bookingId: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>How was your experience?</h2>
        <p>Hi ${customerName},</p>
        <p>We hope your booking with <strong>${businessName}</strong> went well!</p>
        <p>Your feedback helps other customers find great services. Would you mind leaving a quick review?</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://urbanhelp.com.au/bookings/${bookingId}/review" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Leave a Review</a>
        </p>
        <p>Thanks for using Urban Help!</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Share Your Experience`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send review request email:', error);
      throw error;
    }
  }

  async sendBookingNoShowEmail(
    customerEmail: string,
    businessName: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Not Completed</h2>
        <p>The booking with <strong>${businessName}</strong> was marked as no-show.</p>
        <p>We noticed the business arrived but you weren't available.</p>
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>If you'd like to reschedule, you can do so from your account or contact the business directly.</p>
        </div>
        <p>Multiple no-shows may affect your account standing on Urban Help.</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Booking No-Show Notice`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send no-show email:', error);
      throw error;
    }
  }

  async sendPaymentReceiptEmail(
    customerEmail: string,
    customerName: string,
    businessName: string,
    amount: number,
    bookingId: string,
    paymentId: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const formattedAmount = `$${amount.toFixed(2)}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your payment to <strong>${businessName}</strong> via Urban Help.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
          <p><strong>Business:</strong> ${businessName}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Booking Reference:</strong> ${bookingId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
        </div>
        <p>A copy of this receipt has been saved to your account.</p>
        <p>If you have any questions about this payment, please contact support@urbanhelp.com.au</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Payment Receipt`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send payment receipt email:', error);
      throw error;
    }
  }

  async sendReviewNotificationEmail(
    businessEmail: string,
    businessName: string,
    rating: number,
    reviewTitle: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const starRating = '⭐'.repeat(rating);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Review on Urban Help</h2>
        <p>Hi ${businessName},</p>
        <p>You've received a new review from a customer.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Rating:</strong> ${starRating} (${rating}/5)</p>
          <p><strong>Title:</strong> ${reviewTitle}</p>
        </div>
        <p><a href="https://urbanhelp.com.au/business/reviews" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Review</a></p>
        <p>Great reviews help attract more customers. Keep up the good work!</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: `Urban Help - New ${rating}-Star Review`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send review notification email:', error);
      throw error;
    }
  }

  async sendReviewReminderEmail(
    customerEmail: string,
    customerName: string,
    businessName: string,
    bookingId: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>How was your experience?</h2>
        <p>Hi ${customerName},</p>
        <p>We hope your service with <strong>${businessName}</strong> was great!</p>
        <p>Your review helps other customers find trustworthy services. Would you take a moment to share your experience?</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://urbanhelp.com.au/bookings/${bookingId}/review" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Leave a Review</a>
        </p>
        <p>Thank you for choosing Urban Help!</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: customerEmail,
        from: config.fromEmail,
        subject: `Urban Help - Share Your Experience with ${businessName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send review reminder email:', error);
      throw error;
    }
  }

  async sendAverageRatingUpdateEmail(
    businessEmail: string,
    businessName: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    const config = sendgridConfig();
    const starRating = '⭐'.repeat(Math.round(averageRating));

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Rating Has Been Updated</h2>
        <p>Hi ${businessName},</p>
        <p>Based on recent customer reviews, here's your updated rating:</p>
        <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">${starRating}</h3>
          <p style="margin: 0;"><strong>${averageRating}/5.0 based on ${totalReviews} reviews</strong></p>
        </div>
        <p>A higher rating means more customers will find and book your services. Keep delivering great work!</p>
        <p><a href="https://urbanhelp.com.au/business/reviews" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Reviews</a></p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: `Urban Help - Your Rating Updated to ${averageRating}/5`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send rating update email:', error);
      throw error;
    }
  }

  async sendLowRatingAlertEmail(
    businessEmail: string,
    businessName: string,
    rating: number,
    reviewComment: string,
  ): Promise<void> {
    const config = sendgridConfig();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Review Alert</h2>
        <p>Hi ${businessName},</p>
        <p>You've received a review with a lower rating. Here's the feedback:</p>
        <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Rating:</strong> ${rating}/5</p>
          <p><strong>Feedback:</strong> ${reviewComment}</p>
        </div>
        <p>This is an opportunity to improve your service. Consider reaching out to the customer if possible, or make adjustments to address their concerns.</p>
        <p><a href="https://urbanhelp.com.au/business/reviews" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Review</a></p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({
        to: businessEmail,
        from: config.fromEmail,
        subject: `Urban Help - Review Alert: ${rating}-Star Review`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send low rating alert:', error);
      throw error;
    }
  }

  // Compatibility wrappers expected by older callers
  async sendBookingDeclinedEmail(
    customerEmail: string,
    customerFirstName: string,
    businessName: string,
    reason?: string,
  ): Promise<void> {
    // Reuse cancellation email template where appropriate
    const cancellationReason = reason || 'The business declined this booking';
    await this.sendBookingCancellationEmail(customerEmail, businessName, cancellationReason, 0);
  }

  async sendBookingAcceptanceRequestEmail(
    businessEmail: string,
    businessName: string,
    customerFirstName: string,
    serviceName: string,
    scheduledDate: Date,
    acceptLink: string,
    declineLink: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const formattedDate = scheduledDate.toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking Request</h2>
        <p>Hi ${businessName},</p>
        <p>You have a new booking request from ${customerFirstName} for ${serviceName} on ${formattedDate} at ${time}.</p>
        <p style="margin: 20px 0;">Accept or decline using the links below:</p>
        <p><a href="${acceptLink}" style="display:inline-block;background:#4CAF50;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px;">Accept</a>
        <a href="${declineLink}" style="display:inline-block;background:#F44336;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;">Decline</a></p>
        <p>Best regards,<br/>Urban Help Team</p>
      </div>
    `;

    try {
      await sgMail.send({ to: businessEmail, from: config.fromEmail, subject: 'Urban Help - New Booking Request', html: htmlContent });
    } catch (error) {
      console.error('Failed to send booking acceptance request email:', error);
      throw error;
    }
  }

  async sendPaymentRequestEmail(
    customerEmail: string,
    customerFirstName: string,
    businessName: string,
    amount: number | string,
    scheduledDate: Date,
    paymentLink: string,
  ): Promise<void> {
    const config = sendgridConfig();
    const amt = typeof amount === 'number' ? `$${amount.toFixed(2)}` : amount;
    const formattedDate = scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Request</h2>
        <p>Hi ${customerFirstName},</p>
        <p>Please complete payment of <strong>${amt}</strong> to confirm your booking with <strong>${businessName}</strong> on ${formattedDate}.</p>
        <p style="text-align:center; margin:20px 0;"><a href="${paymentLink}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">Complete Payment</a></p>
        <p>If you have any issues, reply to this email or contact support@urbanhelp.com.au</p>
      </div>
    `;

    try {
      await sgMail.send({ to: customerEmail, from: config.fromEmail, subject: 'Urban Help - Payment Request', html: htmlContent });
    } catch (error) {
      console.error('Failed to send payment request email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string,
    expiryMinutes?: number,
  ): Promise<void> {
    const config = sendgridConfig();
    const expires = expiryMinutes ? `This link expires in ${expiryMinutes} minutes.` : '';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
        <h2>Password Reset Requested</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your Urban Help password. Click the link below to set a new password.</p>
        <p style="text-align:center;margin:20px 0;"><a href="${resetLink}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
        <p>${expires}</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `;

    try {
      await sgMail.send({ to: email, from: config.fromEmail, subject: 'Urban Help - Password Reset', html: htmlContent });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendPasswordResetConfirmationEmail(email: string, firstName: string): Promise<void> {
    const config = sendgridConfig();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
        <h2>Your Password Has Been Reset</h2>
        <p>Hi ${firstName},</p>
        <p>Your password has been successfully reset. If you did not perform this action, please contact support immediately.</p>
      </div>
    `;
    try {
      await sgMail.send({ to: email, from: config.fromEmail, subject: 'Urban Help - Password Reset Confirmation', html: htmlContent });
    } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentFailedEmail(email: string, businessName: string, reason: string): Promise<void> {
    const config = sendgridConfig();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Failed</h2>
        <p>Hi,</p>
        <p>A payment transaction for <strong>${businessName}</strong> could not be processed.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;
    try {
      await sgMail.send({ to: email, from: config.fromEmail, subject: 'Urban Help - Payment Failed', html: htmlContent });
    } catch (error) {
      console.error('Failed to send payment failed email:', error);
      throw error;
    }
  }

  async sendAccountLockedEmail(email: string, firstName: string): Promise<void> {
    const config = sendgridConfig();
    const unlockLink = 'https://urbanhelp.com.au/auth/unlock-account';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Temporarily Locked</h2>
        <p>Hi ${firstName},</p>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>For security reasons, your account will be automatically unlocked in 30 minutes. If you did not attempt to log in, you can unlock it immediately:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${unlockLink}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Unlock Account</a>
        </p>
        <p>Best regards,<br>Urban Help Team</p>
      </div>
    `;
    try {
      await sgMail.send({ to: email, from: config.fromEmail, subject: 'Urban Help - Account Temporarily Locked', html: htmlContent });
    } catch (error) {
      console.error('Failed to send account locked email:', error);
      throw error;
    }
  }

  async sendPayoutProcessedEmail(businessEmail: string, businessName: string, amount: number): Promise<void> {
    const config = sendgridConfig();
    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Payout Processed</h2><p>Hi ${businessName},</p><p>Your payout of $${amount.toFixed(2)} has been processed.</p><p>Best regards,<br>Urban Help Team</p></div>`;
    try {
      await sgMail.send({ to: businessEmail, from: config.fromEmail, subject: "Urban Help - Payout Processed", html: htmlContent });
    } catch (error) {
      console.error("Failed to send payout processed email:", error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const config = sendgridConfig();
    try {
      await sgMail.send({ to, from: config.fromEmail, subject, html });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
