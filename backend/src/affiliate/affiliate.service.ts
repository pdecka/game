import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency, TransactionType, UserRole } from '@gaming-platform/shared';
import { WalletService } from '../wallet/wallet.service';
import { toNum } from '../common/utils/prisma-decimal';

const AFFILIATE_ROW_ID = 'default';

@Injectable()
export class AffiliateService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}

  async onModuleInit() {
    const row = await this.prisma.affiliateGlobal.findUnique({ where: { id: AFFILIATE_ROW_ID } });
    if (!row) {
      await this.prisma.affiliateGlobal.create({
        data: {
          id: AFFILIATE_ROW_ID,
          commissionRate: 0.005,
        },
      });
    }
  }

  async getGlobalRate(): Promise<number> {
    const row = await this.prisma.affiliateGlobal.findUnique({ where: { id: AFFILIATE_ROW_ID } });
    return toNum(row?.commissionRate ?? 0.005);
  }

  async setGlobalRate(rate: number) {
    const row = await this.prisma.affiliateGlobal.findUnique({ where: { id: AFFILIATE_ROW_ID } });
    if (!row) {
      return this.prisma.affiliateGlobal.create({
        data: { id: AFFILIATE_ROW_ID, commissionRate: rate },
      });
    }
    return this.prisma.affiliateGlobal.update({
      where: { id: AFFILIATE_ROW_ID },
      data: { commissionRate: rate },
    });
  }

  async getStatsForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const referredCount = await this.prisma.user.count({ where: { referredByUserId: userId } });
    const earnings = await this.prisma.affiliateEarning.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const totals = await this.prisma.affiliateEarning.aggregate({
      where: { referrerUserId: userId },
      _sum: { commissionAmount: true },
    });
    return {
      referralCode: user?.referralCode ?? null,
      totalReferrals: referredCount,
      totalEarnings: toNum(totals._sum.commissionAmount),
      history: earnings,
    };
  }

  async adminOverview() {
    const rate = await this.getGlobalRate();
    const totalPaid = await this.prisma.affiliateEarning.aggregate({
      _sum: { commissionAmount: true },
    });
    const referredUsers = await this.prisma.user.count({
      where: { referredByUserId: { not: null } },
    });
    return {
      globalCommissionRate: rate,
      totalCommissionPaid: toNum(totalPaid._sum.commissionAmount),
      usersWithReferrer: referredUsers,
    };
  }

  /**
   * Called after a successful BET ledger row (casino or sports).
   */
  async recordBetCommission(
    referredUserId: string,
    currency: Currency,
    betAmount: number,
    referenceId?: string,
    _metadata?: Record<string, any>,
  ): Promise<void> {
    if (!betAmount || betAmount <= 0) return;

    const player = await this.prisma.user.findUnique({ where: { id: referredUserId } });
    if (!player || player.role !== UserRole.USER || !player.referredByUserId) return;

    const referrer = await this.prisma.user.findUnique({ where: { id: player.referredByUserId } });
    if (!referrer) return;

    if (referenceId) {
      const dup = await this.prisma.affiliateEarning.findFirst({
        where: { referrerUserId: referrer.id, referredUserId, referenceId },
      });
      if (dup) return;
    }

    const globalRate = await this.getGlobalRate();
    const override =
      referrer.affiliateRateOverride != null ? toNum(referrer.affiliateRateOverride) : null;
    const rate = override != null && !Number.isNaN(override) ? override : globalRate;
    if (!rate || rate <= 0) return;

    const commissionAmount = Number((betAmount * rate).toFixed(8));
    if (commissionAmount <= 0) return;

    await this.walletService.createTransaction(
      referrer.id,
      currency,
      commissionAmount,
      TransactionType.COMMISSION,
      referenceId,
      { referredUserId, source: 'bet_commission' },
    );

    await this.prisma.affiliateEarning.create({
      data: {
        referrerUserId: referrer.id,
        referredUserId,
        betAmount,
        commissionAmount,
        currency,
        referenceId: referenceId ?? null,
      },
    });
  }
}
