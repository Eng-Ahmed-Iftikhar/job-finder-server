import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.warn(
        'Twilio credentials not configured, SMS will not be sent',
      );
      return;
    }

    try {
      this.client = new twilio.Twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Twilio client not available');
      return false;
    }

    try {
      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');

      if (!from) {
        this.logger.error('TWILIO_PHONE_NUMBER not configured');
        return false;
      }

      this.logger.debug(`Sending SMS to ${to}: ${message.substring(0, 50)}...`);

      const result = await this.client.messages.create({
        body: message,
        from: from,
        to: to,
      });

      this.logger.log(`SMS sent successfully to ${to}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Twilio SMS error for ${to}:`, error);
      return false;
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const message = `Your verification code is: ${code}. Valid for 10 minutes.`;
    return this.sendSms(to, message);
  }
}
