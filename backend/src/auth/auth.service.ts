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

  async register(email: string, username: string, password: string, phone?: string, referralCode?: string) {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const existingByUsername = await this.usersService.findByUsername(username);
      if (existingByUsername) {
        throw new BadRequestException('Username already exists');
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
        email,
        username,
        password: hashedPassword,
        phone: phone || undefined,
        referredByUserId,
        // Require OTP verification before the account becomes active.
        status: UserStatus.KYC_PENDING,
      });

      // Send OTP for verification (OTP_EXPIRES_IN is enforced inside otp.service.ts)
      const otp = await this.otpService.sendOtp(user.email, user.phone);

      const { password: _, ...result } = user;
      // Dev-only: expose OTP so it can be received without an SMS gateway.
      // This keeps the signup -> verifyOtp -> login flow working in local environments.
      if (phone && process.env.NODE_ENV !== 'production') {
        return { ...result, devOtp: otp };
      }

      return result;
    } catch (err: any) {
      // Re-throw known HTTP errors as-is.
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err?.message || 'Failed to register');
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const isValid = await this.otpService.verifyOtp(email, otp);
      if (!isValid) {
        throw new BadRequestException('Invalid OTP');
      }

      // Activate user only after OTP verification.
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      await this.usersService.update(user.id, { status: UserStatus.ACTIVE });
      return { verified: true };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(err?.message || 'OTP verification failed');
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
