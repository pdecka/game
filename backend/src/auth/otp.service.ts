import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private otpStore: Map<string, { otp: string; expiresAt: number; phone?: string }> = new Map();

  constructor(private configService: ConfigService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, phone?: string, countryCode?: string): Promise<{ otp: string; expiresAt: number }> {
    const otp = this.generateOtp();
    const expiresIn = parseInt(this.configService.get('OTP_EXPIRES_IN') || '300');
    const expiresAt = Date.now() + expiresIn * 1000;

    // Store OTP with phone number for verification
    this.otpStore.set(email, { otp, expiresAt, phone });

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // In production, send SMS via actual provider (Twilio, etc.)
      // TODO: Integrate with SMS provider like Twilio
      if (phone && countryCode) {
        const fullPhone = `${countryCode}${phone}`;
        await this.sendSmsViaProvider(fullPhone, otp);
      }
    } else {
      // In development, log OTP and return it for testing
      console.log(`[DEV] OTP for ${email}: ${otp} (expires in ${expiresIn}s)`);
      if (phone) {
        const fullPhone = countryCode ? `${countryCode}${phone}` : phone;
        console.log(`[DEV] SMS OTP to ${fullPhone}: ${otp}`);
      }
    }

    // In development, return OTP for frontend display
    return { otp, expiresAt };
  }

  private async sendSmsViaProvider(phone: string, otp: string): Promise<void> {
    // TODO: Implement actual SMS sending via Twilio or similar
    // For now, this is a placeholder
    console.log(`[PRODUCTION] SMS would be sent to ${phone}: Your OTP is ${otp}`);
  }

  verifyOtp(email: string, otp: string): boolean {
    const stored = this.otpStore.get(email);
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }

    if (stored.otp !== otp) {
      return false;
    }

    this.otpStore.delete(email);
    return true;
  }

  // Method to resend OTP
  async resendOtp(email: string): Promise<{ otp: string; expiresAt: number } | null> {
    const stored = this.otpStore.get(email);
    if (!stored) {
      return null;
    }

    return this.sendOtp(email, stored.phone);
  }
}
