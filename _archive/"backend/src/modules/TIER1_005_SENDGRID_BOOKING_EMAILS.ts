// backend/src/notifications/sendgrid.service.ts - BOOKING EMAIL EXTENSIONS
// Add these methods to the existing SendGridService

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
