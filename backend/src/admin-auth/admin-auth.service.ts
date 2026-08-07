import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@gaming-platform/shared';
import * as bcrypt from 'bcrypt';
import { timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';

const ADMIN_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.RISK_MANAGER,
];

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private isAdminRole(role: UserRole): boolean {
    return ADMIN_ROLES.includes(role);
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }

  /**
   * Admin signup is NOT public:
   * - If ADMIN_SIGNUP_CODE is configured, the provided code must match.
   * - Otherwise signup is only allowed to bootstrap the very first admin
   *   account; once any admin exists, further signups are rejected.
   */
  private async assertSignupAllowed(signupCode?: string): Promise<void> {
    const requiredCode = (this.configService.get<string>('ADMIN_SIGNUP_CODE') || '').trim();

    if (requiredCode) {
      if (!signupCode || !this.safeCompare(signupCode.trim(), requiredCode)) {
        throw new ForbiddenException('Invalid admin signup code');
      }
      return;
    }

    const adminCount = await this.usersService.countByRoles(ADMIN_ROLES);
    if (adminCount > 0) {
      throw new ForbiddenException(
        'Admin signup is disabled. Set ADMIN_SIGNUP_CODE to allow invited admin signups.',
      );
    }
  }

  async signup(
    email: string,
    username: string,
    password: string,
    role: UserRole = UserRole.ADMIN,
    signupCode?: string,
  ) {
    try {
      await this.assertSignupAllowed(signupCode);
      if (!this.isAdminRole(role)) {
        throw new BadRequestException('Invalid admin role');
      }

      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        throw new BadRequestException('User already exists');
      }

      const existingByUsername = await this.usersService.findByUsername(username);
      if (existingByUsername) {
        throw new BadRequestException('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        username,
        password: hashedPassword,
        role,
      });

      const { password: _, twoFactorSecret, ...result } = user;
      console.log('[admin/auth/signup] OK:', { userId: result?.id, status: result?.status, role: result?.role });
      return result;
    } catch (error) {
      console.log('[admin/auth/signup] ERROR:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('[admin/auth/login] INPUT:', { email });
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('Account is not active');
      }

      if (!this.isAdminRole(user.role as UserRole)) {
        throw new UnauthorizedException('Admin access required');
      }

      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        scope: 'admin',
      };

      const res = {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      };
      console.log('[admin/auth/login] OK:', { token: Boolean(res?.access_token), userId: res?.user?.id, role: res?.user?.role });
      return res;
    } catch (error) {
      console.log('[admin/auth/login] ERROR:', error);
      throw error;
    }
  }
}

