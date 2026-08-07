import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { BonusType, BonusStatus, Currency, TransactionType } from '@gaming-platform/shared';
import { toNum } from '../common/utils/prisma-decimal';

@Injectable()
export class BonusService {
  constructor(
    private readonly prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async createBonus(
    userId: string,
    type: BonusType,
    amount: number,
    currency: Currency,
    wageringRequirement: number,
    expiresInDays: number = 30,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const savedBonus = await this.prisma.bonus.create({
      data: {
        userId,
        type: type as any,
        amount,
        currency,
        wageringRequirement,
        expiresAt,
        status: BonusStatus.ACTIVE as any,
      },
    });

    // Credit bonus to wallet
    await this.walletService.createTransaction(
      userId,
      currency,
      amount,
      TransactionType.BONUS,
      savedBonus.id,
    );

    return savedBonus;
  }

  async applyWelcomeBonus(userId: string, depositAmount: number, currency: Currency) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { type: BonusType.WELCOME as any, active: true },
    });

    if (!promotion || new Date() < promotion.startDate || new Date() > promotion.endDate) {
      return null;
    }

    let bonusAmount = 0;
    if (promotion.bonusPercentage) {
      bonusAmount = (depositAmount * toNum(promotion.bonusPercentage)) / 100;
      if (promotion.maxBonus) {
        bonusAmount = Math.min(bonusAmount, toNum(promotion.maxBonus));
      }
    } else if (promotion.bonusAmount) {
      bonusAmount = toNum(promotion.bonusAmount);
    }

    if (bonusAmount > 0) {
      return this.createBonus(
        userId,
        BonusType.WELCOME,
        bonusAmount,
        currency,
        toNum(promotion.wageringRequirement),
      );
    }

    return null;
  }

  async updateWagering(userId: string, wageredAmount: number, currency: Currency): Promise<void> {
    const activeBonuses = await this.prisma.bonus.findMany({
      where: {
        userId,
        currency,
        status: BonusStatus.ACTIVE as any,
      },
    });

    for (const bonus of activeBonuses) {
      let newWagered = toNum(bonus.wageredAmount) + wageredAmount;
      let status: BonusStatus = BonusStatus.ACTIVE;

      if (newWagered >= toNum(bonus.wageringRequirement)) {
        status = BonusStatus.USED;
      }

      if (new Date() > bonus.expiresAt) {
        status = BonusStatus.EXPIRED;
      }

      await this.prisma.bonus.update({
        where: { id: bonus.id },
        data: {
          wageredAmount: newWagered,
          status: status as any,
        },
      });
    }
  }

  async getUserBonuses(userId: string) {
    return this.prisma.bonus.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
