import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole, UserStatus, KYCStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: userData.email!,
        username: userData.username!,
        password: userData.password!,
        phone: userData.phone ?? null,
        countryCode: userData.countryCode ?? null,
        role: (userData.role as UserRole) ?? UserRole.user,
        status: (userData.status as UserStatus) ?? UserStatus.active,
        kycStatus: (userData.kycStatus as KYCStatus) ?? KYCStatus.pending,
        twoFactorEnabled: userData.twoFactorEnabled ?? false,
        twoFactorSecret: userData.twoFactorSecret ?? null,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        dateOfBirth: userData.dateOfBirth ?? null,
        address: userData.address ?? null,
        country: userData.country ?? null,
        city: userData.city ?? null,
        postalCode: userData.postalCode ?? null,
        ipAddress: userData.ipAddress ?? null,
        deviceFingerprint: userData.deviceFingerprint ?? null,
        referralCode: userData.referralCode ?? null,
        referredByUserId: userData.referredByUserId ?? null,
        affiliateRateOverride: userData.affiliateRateOverride ?? null,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByReferralCode(code: string): Promise<User | null> {
    if (!code) return null;
    const normalized = code.trim().toUpperCase();
    return this.prisma.user.findUnique({ where: { referralCode: normalized } });
  }

  async countByRoles(roles: UserRole[] | string[]): Promise<number> {
    return this.prisma.user.count({
      where: { role: { in: roles as UserRole[] } },
    });
  }

  private generateReferralCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(8);
    let out = '';
    for (let i = 0; i < 8; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  }

  async ensureReferralCode(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (user.referralCode) return user;
    for (let i = 0; i < 15; i++) {
      const code = this.generateReferralCode();
      const clash = await this.prisma.user.findUnique({ where: { referralCode: code } });
      if (!clash) {
        return this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
        });
      }
    }
    throw new Error('Failed to allocate referral code');
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.prisma.user.update({
      where: { id },
      data: updateData as any,
    });
    return this.findOne(id);
  }

  async updateStatus(id: string, status: UserStatus | string): Promise<User> {
    return this.update(id, { status: status as UserStatus });
  }

  async updateKYCStatus(id: string, kycStatus: KYCStatus | string): Promise<User> {
    return this.update(id, { kycStatus: kycStatus as KYCStatus });
  }

  async updateLastLogin(id: string, ipAddress?: string, deviceFingerprint?: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        ipAddress,
        deviceFingerprint,
      },
    });
  }
}
