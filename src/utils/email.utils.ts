import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = {} as nodemailer.Transporter;
    this.createTransporter();
  }

  private createTransporter(): void {
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development email configuration (using Ethereal Email for testing)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Define email options
      const mailOptions = {
        from: `Recipe Sharing Platform <${process.env.SMTP_USER || 'noreply@recipeapp.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message
      };

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Template methods for different types of emails
  async sendWelcomeEmail(email: string, username: string, verificationUrl: string): Promise<void> {
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🍳 Recipe Sharing</h1>
          </div>
          
          <h2 style="color: #27ae60; margin-bottom: 20px;">Welcome to our community, ${username}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We're excited to have you join our recipe sharing community! Get ready to discover amazing recipes and share your culinary creations with food lovers from around the world.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">Verify Your Account</a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">What you can do:</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li>📚 Share your favorite recipes</li>
              <li>🔍 Discover new dishes from around the world</li>
              <li>Rate and review recipes</li>
              <li>👥 Follow other amazing cooks</li>
              <li>💬 Connect with the community</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">Happy cooking! 👨‍🍳👩‍🍳</p>
            <p style="color: #999; font-size: 12px;">The Recipe Sharing Team</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: 'Welcome to Recipe Sharing Platform!',
      html
    });
  }

  async sendPasswordResetEmail(email: string, username: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🍳 Recipe Sharing</h1>
          </div>
          
          <h2 style="color: #e74c3c; margin-bottom: 20px;">🔐 Password Reset Request</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Hi ${username}, we received a request to reset your password for your Recipe Sharing account.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">Important:</p>
            <ul style="color: #856404; margin: 10px 0;">
              <li>This link will expire in <strong>10 minutes</strong></li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged if you don't click the link</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #777; line-height: 1.6;">
            If the button doesn't work, copy and paste this link in your browser:
            <br>
            <span style="word-break: break-all; color: #3498db;">${resetUrl}</span>
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">Stay secure!</p>
            <p style="color: #999; font-size: 12px;">The Recipe Sharing Team</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: '🔐 Password Reset Request - Recipe Sharing',
      html
    });
  }

  async sendNotificationEmail(email: string, username: string, notification: { title: string; message: string; actionUrl?: string }): Promise<void> {
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🍳 Recipe Sharing</h1>
          </div>
          
          <h2 style="color: #3498db; margin-bottom: 20px;">${notification.title}</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Hi ${username},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ${notification.message}
          </p>
          
          ${notification.actionUrl ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${notification.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">View Details</a>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">Happy cooking! 👨‍🍳👩‍🍳</p>
            <p style="color: #999; font-size: 12px;">The Recipe Sharing Team</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: `${notification.title} - Recipe Sharing`,
      html
    });
  }
}

// Create a singleton instance
const emailService = new EmailService();

// Export the sendEmail function for backward compatibility
export const sendEmail = (options: EmailOptions): Promise<void> => {
  return emailService.sendEmail(options);
};

// Export the email service for more advanced usage
export { emailService };
export type { EmailOptions };