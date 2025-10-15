import { logger } from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private from = process.env.EMAIL_FROM || 'noreply@academicnotes.com';
  private serviceType = process.env.EMAIL_SERVICE || 'console';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For development, log to console
      if (this.serviceType === 'console' || process.env.NODE_ENV === 'development') {
        logger.info('📧 Email would be sent:');
        logger.info(`To: ${options.to}`);
        logger.info(`Subject: ${options.subject}`);
        logger.info(`Body: ${options.text || 'HTML content'}`);
        return true;
      }

      // TODO: Integrate with SendGrid, AWS SES, or other email service
      // For production, you would implement the actual email sending here
      logger.warn('Email service not configured for production');
      return false;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendItemApprovalEmail(uploaderEmail: string, uploaderName: string, itemTitle: string) {
    const subject = '🎉 Your item has been approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Good news, ${uploaderName}!</h2>
        <p>Your item <strong>"${itemTitle}"</strong> has been approved and is now live on the marketplace.</p>
        <p>Students can now discover and purchase your academic notes.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;">
            <strong>What's next?</strong><br>
            Watch your earnings grow as students purchase your notes. You can request a payout anytime from your dashboard.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for contributing to our academic community!
        </p>
      </div>
    `;
    const text = `Good news, ${uploaderName}! Your item "${itemTitle}" has been approved and is now live on the marketplace.`;

    return this.sendEmail({
      to: uploaderEmail,
      subject,
      html,
      text
    });
  }

  async sendItemRejectionEmail(uploaderEmail: string, uploaderName: string, itemTitle: string, reason: string) {
    const subject = 'Item submission update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Item Submission Update</h2>
        <p>Hi ${uploaderName},</p>
        <p>We've reviewed your submission <strong>"${itemTitle}"</strong> and unfortunately, it doesn't meet our current guidelines.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Reason:</strong><br>
            ${reason}
          </p>
        </div>
        <p>Please review our guidelines and feel free to resubmit after making the necessary changes.</p>
        <p style="color: #6b7280; font-size: 14px;">
          If you have questions, please contact our support team.
        </p>
      </div>
    `;
    const text = `Hi ${uploaderName}, Your item "${itemTitle}" was not approved. Reason: ${reason}`;

    return this.sendEmail({
      to: uploaderEmail,
      subject,
      html,
      text
    });
  }

  async sendPayoutApprovedEmail(uploaderEmail: string, uploaderName: string, amount: number) {
    const subject = '💰 Payout approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payout Approved!</h2>
        <p>Hi ${uploaderName},</p>
        <p>Good news! Your payout request for <strong>₦${amount.toLocaleString()}</strong> has been approved.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;">
            <strong>Processing Details:</strong><br>
            Your payout is being processed and funds will arrive within 2-3 business days.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for being part of our community!
        </p>
      </div>
    `;
    const text = `Hi ${uploaderName}, Your payout request for ₦${amount.toLocaleString()} has been approved. Funds will arrive within 2-3 business days.`;

    return this.sendEmail({
      to: uploaderEmail,
      subject,
      html,
      text
    });
  }

  async sendPayoutRejectedEmail(uploaderEmail: string, uploaderName: string, amount: number, reason: string) {
    const subject = 'Payout request update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Payout Request Update</h2>
        <p>Hi ${uploaderName},</p>
        <p>Your payout request for <strong>₦${amount.toLocaleString()}</strong> was not approved.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">
            <strong>Reason:</strong><br>
            ${reason}
          </p>
        </div>
        <p>Please review the reason and contact support if you have any questions.</p>
        <p style="color: #6b7280; font-size: 14px;">
          You can submit a new payout request after addressing the issue.
        </p>
      </div>
    `;
    const text = `Hi ${uploaderName}, Your payout request for ₦${amount.toLocaleString()} was rejected. Reason: ${reason}`;

    return this.sendEmail({
      to: uploaderEmail,
      subject,
      html,
      text
    });
  }

  async sendPurchaseConfirmationEmail(buyerEmail: string, buyerName: string, itemTitle: string, amount: number) {
    const subject = '✅ Purchase confirmed!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Purchase Confirmed!</h2>
        <p>Hi ${buyerName},</p>
        <p>Thank you for your purchase! You now have access to <strong>"${itemTitle}"</strong>.</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Order Details:</strong><br>
            Item: ${itemTitle}<br>
            Amount: ₦${amount.toLocaleString()}
          </p>
        </div>
        <p>You can download your file from the "Purchases" section in your dashboard.</p>
        <p style="color: #6b7280; font-size: 14px;">
          Happy studying!
        </p>
      </div>
    `;
    const text = `Hi ${buyerName}, Your purchase of "${itemTitle}" for ₦${amount.toLocaleString()} is confirmed. Download it from your dashboard.`;

    return this.sendEmail({
      to: buyerEmail,
      subject,
      html,
      text
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string, role: string) {
    const subject = 'Welcome to Academic Notes! 🎓';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Academic Notes!</h2>
        <p>Hi ${userName},</p>
        <p>We're excited to have you join our academic community as a <strong>${role}</strong>!</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          ${role === 'uploader' ? `
            <p style="margin: 0; color: #1e40af;">
              <strong>Get Started:</strong><br>
              • Upload your first academic note<br>
              • Set your pricing<br>
              • Start earning when students purchase
            </p>
          ` : `
            <p style="margin: 0; color: #1e40af;">
              <strong>Get Started:</strong><br>
              • Browse the marketplace<br>
              • Find notes for your courses<br>
              • Purchase and download instantly
            </p>
          `}
        </div>
        <p>If you have any questions, our support team is here to help.</p>
        <p style="color: #6b7280; font-size: 14px;">
          Best of luck with your studies!
        </p>
      </div>
    `;
    const text = `Welcome to Academic Notes, ${userName}! We're excited to have you as a ${role}.`;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }
}

export const emailService = new EmailService();
