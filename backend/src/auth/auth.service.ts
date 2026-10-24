import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { TwoFactorService } from './two-factor.service';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@gaming-platform/shared';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private twoFactorService: TwoFactorService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // `email` comes from the passport local strategy `usernameField`.
    // We support both:
    // - email login (existing flow)
    // - username login (new flow) by falling back to `findByUsername`.
    const user =
      (await this.usersService.findByEmail(email)) ||
      (await this.usersService.findByUsername(email));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.KYC_PENDING) {
      throw new UnauthorizedException('Verify the OTP sent to your email before logging in')
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  async register(email: string | undefined, username: string, password: string, phone: string, countryCode: string, referralCode?: string) {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new BadRequestException('A valid email is required')
      }

      // Check if username already exists
      const existingByUsername = await this.usersService.findByUsername(username);
      if (existingByUsername) {
        throw new BadRequestException('Username already exists');
      }

      if (phone) {
        const existingByPhone = await this.usersService.findByPhone(phone, countryCode || '');
        if (existingByPhone) {
          throw new BadRequestException('Phone number already registered');
        }
      }

      const existingUser = await this.usersService.findByEmail(normalizedEmail);
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      let referredByUserId: string | undefined;
      if (referralCode) {
        const refUser = await this.usersService.findByReferralCode(referralCode);
        if (refUser) {
          referredByUserId = refUser.id;
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email: normalizedEmail,
        username,
        password: hashedPassword,
        phone: phone || null,
        countryCode: countryCode || null,
        referredByUserId,
        status: UserStatus.KYC_PENDING,
      });

      const otpResult = await this.otpService.sendOtp(normalizedEmail, user.phone || undefined, user.countryCode || undefined);

      const { password: _, ...result } = user;
      return {
        ...result,
        email: normalizedEmail,
        mailed: otpResult.mailed,
        expiresAt: otpResult.expiresAt,
        ...(process.env.NODE_ENV !== 'production' ? { devOtp: otpResult.otp } : {}),
      }
    } catch (err: any) {
      // Re-throw known HTTP errors as-is.
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err?.message || 'Failed to register');
    }
  }

  async verifyOtp(identifier: string, otp: string) {
    try {
      const lookup = String(identifier || '').trim()
      const isValid = this.otpService.verifyOtp(lookup, otp);
      if (!isValid) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      let user = lookup.includes('@')
        ? await this.usersService.findByEmail(lookup.toLowerCase())
        : null
      if (!user) {
        user = await this.usersService.findByEmail(lookup)
      }
      if (!user) {
        user = await this.usersService.findByPhone(lookup, '') || await this.usersService.findByUsername(lookup);
      }
      
      if (!user) {
        throw new BadRequestException('User not found');
      }

      await this.usersService.update(user.id, { status: UserStatus.ACTIVE });
      return { verified: true, email: user.email };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(err?.message || 'OTP verification failed');
    }
  }

  async resendOtp(email: string) {
    const normalized = String(email || '').trim().toLowerCase()
    const user = await this.usersService.findByEmail(normalized)
    if (!user) throw new BadRequestException('User not found')
    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('This account is already verified. Please log in.')
    }
    const otpResult = await this.otpService.sendOtp(normalized, user.phone || undefined, user.countryCode || undefined)
    return {
      sent: true,
      mailed: otpResult.mailed,
      expiresAt: otpResult.expiresAt,
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otpResult.otp } : {}),
    }
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not enabled');
    }

    const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    return { verified: true };
  }

  async enable2FA(userId: string) {
    const user = await this.usersService.findOne(userId);
    const { secret, qrCode } = await this.twoFactorService.generateSecret(user.email);
    
    await this.usersService.update(userId, {
      twoFactorSecret: secret,
    });

    return { secret, qrCode };
  }

  async confirm2FA(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA secret not found');
    }

    const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    await this.usersService.update(userId, {
      twoFactorEnabled: true,
    });

    return { enabled: true };
  }
}
