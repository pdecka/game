import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

  constructor(private configService: ConfigService) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email: string, phone?: string): Promise<string> {
    const otp = this.generateOtp();
    const expiresIn = parseInt(this.configService.get('OTP_EXPIRES_IN') || '300');
    const expiresAt = Date.now() + expiresIn * 1000;

    this.otpStore.set(email, { otp, expiresAt });

    // TODO: integrate a real SMS/Email provider for production delivery.
    // Never log OTPs outside local development.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`OTP for ${email}: ${otp} (expires in ${expiresIn}s)`);
      if (phone) {
        console.log(`SMS OTP to ${phone}: ${otp}`);
      }
    }

    return otp; // Only ever exposed to clients via dev-gated paths.
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
}
