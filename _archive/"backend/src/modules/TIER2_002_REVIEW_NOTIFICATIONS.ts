// backend/src/notifications/sendgrid.service.ts - REVIEW NOTIFICATION EXTENSIONS
// Add these methods to the existing SendGridService

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
