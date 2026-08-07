import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { KYCStatus } from '@gaming-platform/shared';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async submitKyc(userId: string, documentData: Record<string, any>) {
    const kyc = await this.prisma.kycDocument.create({
      data: {
        userId,
        documentType: documentData.documentType ?? null,
        documentNumber: documentData.documentNumber ?? null,
        frontImageUrl: documentData.frontImageUrl ?? null,
        backImageUrl: documentData.backImageUrl ?? null,
        selfieImageUrl: documentData.selfieImageUrl ?? null,
        metadata: documentData.metadata ?? null,
        status: KYCStatus.PENDING as any,
      },
    });

    await this.usersService.updateKYCStatus(userId, KYCStatus.PENDING);
    return kyc;
  }

  async approveKyc(kycId: string, verifiedBy: string) {
    const kyc = await this.prisma.kycDocument.findUnique({ where: { id: kycId } });
    if (!kyc) {
      throw new Error('KYC document not found');
    }

    const updated = await this.prisma.kycDocument.update({
      where: { id: kycId },
      data: {
        status: KYCStatus.VERIFIED as any,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    await this.usersService.updateKYCStatus(kyc.userId, KYCStatus.VERIFIED);
    return updated;
  }

  async rejectKyc(kycId: string, reason: string) {
    const kyc = await this.prisma.kycDocument.findUnique({ where: { id: kycId } });
    if (!kyc) {
      throw new Error('KYC document not found');
    }

    const updated = await this.prisma.kycDocument.update({
      where: { id: kycId },
      data: {
        status: KYCStatus.REJECTED as any,
        rejectionReason: reason,
      },
    });

    await this.usersService.updateKYCStatus(kyc.userId, KYCStatus.REJECTED);
    return updated;
  }

  async getUserKyc(userId: string) {
    return this.prisma.kycDocument.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSubmissions(status?: KYCStatus) {
    return this.prisma.kycDocument.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
