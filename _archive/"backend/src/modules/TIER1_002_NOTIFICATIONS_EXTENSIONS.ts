// backend/src/notifications/sendgrid.service.ts - EXTENSIONS
// Add these methods to the existing SendGridService

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

// backend/src/notifications/twilio.service.ts - EXTENSIONS
// Add these methods to the existing TwilioService

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
