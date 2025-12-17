import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email configuration error:', error);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log('✅ Email server is ready to send messages');
        }
      }
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: `"Job Finder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Job Finder! 🎉',
      html: this.getWelcomeEmailTemplate(firstName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`✅ Welcome email sent to: ${email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationCode: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"Job Finder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Job Finder',
      html: this.getVerificationEmailTemplate(firstName, verificationCode),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`✅ Verification email sent to: ${email}`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to send verification email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetCode: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"Job Finder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - Job Finder',
      html: this.getPasswordResetEmailTemplate(firstName, resetCode),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`✅ Password reset email sent to: ${email}`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password reset email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetConfirmationEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"Job Finder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Confirmation ✅',
      html: this.getPasswordResetConfirmationEmailTemplate(firstName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(
          `✅ Password reset confirmation email sent to: ${email}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password reset confirmation email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordChangeConfirmationEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    const mailOptions = {
      from: `"Job Finder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully ✅',
      html: this.getPasswordChangeConfirmationEmailTemplate(firstName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(
          `✅ Password change confirmation email sent to: ${email}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password change confirmation email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Job Finder!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for joining Job Finder - your gateway to amazing career opportunities!</p>
            <p>We're excited to help you find your dream job. Here's what you can do:</p>
            <ul>
              <li>🔍 Browse thousands of job opportunities</li>
              <li>💼 Apply to jobs that match your skills</li>
              <li>📊 Track your applications</li>
              <li>🔔 Get notified about new opportunities</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
              Start Job Hunting
            </a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationEmailTemplate(
    firstName: string,
    verificationCode: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { background: #1f2937; color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with Job Finder. To complete your registration, please verify your email address.</p>
            <p>Your verification code is:</p>
            <div class="code">${verificationCode}</div>
            <p>Enter this code in the verification form to activate your account.</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This code will expire in 15 minutes for security reasons.
            </div>
            <p>If you didn't create an account with Job Finder, please ignore this email.</p>
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    firstName: string,
    resetCode: string,
  ): string {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?code=${resetCode}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .button:hover { background: #b91c1c; }
          .link { color: #6b7280; font-size: 14px; word-break: break-all; margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>We received a request to reset your password for your Job Finder account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <div class="link">${resetUrl}</div>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 15 minutes for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetConfirmationEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; color: #065f46; }
          .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successfully</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your password has been successfully reset!</p>
            <div class="success">
              <strong>✓ Confirmed:</strong> Your password has been changed and you can now log in with your new password.
            </div>
            <p>If you did not request this password reset, please contact our support team immediately.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
              Log In Now
            </a>
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Log out from other devices if needed</li>
            </ul>
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordChangeConfirmationEmailTemplate(
    firstName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; color: #1e40af; }
          .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Your password has been successfully changed!</p>
            <div class="success">
              <strong>✓ Confirmed:</strong> Your account password has been updated. You remain logged in on this session.
            </div>
            <p>If you did not make this change or do not recognize this activity, please change your password immediately and contact our support team.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
              Go to Dashboard
            </a>
            <p>Security tips:</p>
            <ul>
              <li>Never share your password with anyone</li>
              <li>Use a unique password that you don't use elsewhere</li>
              <li>Change your password regularly</li>
              <li>Log out from other devices if you suspect unauthorized access</li>
            </ul>
            <p>Best regards,<br>The Job Finder Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
