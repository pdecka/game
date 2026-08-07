import { Inject, Injectable, BadRequestException, Optional, forwardRef } from '@nestjs/common';
import {
  Currency,
  TransactionType,
  TransactionStatus,
  BankAccountStatus,
  Prisma,
  Wallet,
  LedgerEntry,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { toNum } from '../common/utils/prisma-decimal';

type DbClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(forwardRef(() => AffiliateService))
    private readonly affiliateService?: AffiliateService,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.prisma.wallet.findFirst({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId } });
    }
    return wallet;
  }

  async getWallet(userId: string): Promise<Wallet> {
    return this.getOrCreateWallet(userId);
  }

  async getBalance(userId: string, currency: Currency | string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.getCurrencyBalance(wallet, currency as Currency);
  }

  async getAvailableBalance(userId: string, currency: Currency | string): Promise<number> {
    return this.getBalance(userId, currency);
  }

  async getLockedExposure(userId: string, currency: Currency | string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.getLockedBalance(wallet, currency as Currency);
  }

  private getCurrencyBalance(wallet: Wallet, currency: Currency): number {
    switch (currency) {
      case Currency.INR:
        return toNum(wallet.inrBalance);
      case Currency.USDT:
        return toNum(wallet.usdtBalance);
      case Currency.BTC:
        return toNum(wallet.btcBalance);
      default:
        return 0;
    }
  }

  private getLockedBalance(wallet: Wallet, currency: Currency): number {
    switch (currency) {
      case Currency.INR:
        return toNum(wallet.inrLocked);
      case Currency.USDT:
        return toNum(wallet.usdtLocked);
      case Currency.BTC:
        return toNum(wallet.btcLocked);
      default:
        return 0;
    }
  }

  /**
   * When `tx` is passed, the caller owns the transaction (no commit here).
   */
  async createTransaction(
    userId: string,
    currency: Currency | string,
    amount: number,
    type: TransactionType | string,
    referenceId?: string,
    metadata?: Record<string, any>,
    tx?: Prisma.TransactionClient,
  ): Promise<LedgerEntry> {
    const cur = currency as Currency;
    const txType = type as TransactionType;

    if (tx) {
      return this.applyTransaction(userId, cur, amount, txType, referenceId, metadata, tx);
    }

    const savedEntry = await this.prisma.$transaction(async (client) => {
      return this.applyTransaction(userId, cur, amount, txType, referenceId, metadata, client);
    });

    if (txType === TransactionType.bet && this.affiliateService) {
      Promise.resolve(
        this.affiliateService.recordBetCommission(
          userId,
          cur as any,
          amount,
          savedEntry.referenceId ?? undefined,
          metadata,
        ),
      ).catch(() => {});
    }

    return savedEntry;
  }

  private async ensureWallet(db: DbClient, userId: string): Promise<Wallet> {
    const found = await db.wallet.findFirst({ where: { userId } });
    if (found) return found;
    return db.wallet.create({ data: { userId } });
  }

  private balanceUpdateData(
    currency: Currency,
    balance: number,
    locked: number,
  ): Prisma.WalletUpdateInput {
    switch (currency) {
      case Currency.INR:
        return { inrBalance: balance, inrLocked: locked };
      case Currency.USDT:
        return { usdtBalance: balance, usdtLocked: locked };
      case Currency.BTC:
        return { btcBalance: balance, btcLocked: locked };
      default:
        return {};
    }
  }

  private async applyTransaction(
    userId: string,
    currency: Currency,
    amount: number,
    type: TransactionType,
    referenceId: string | undefined,
    metadata: Record<string, any> | undefined,
    db: DbClient,
  ): Promise<LedgerEntry> {
    const wallet = await this.ensureWallet(db, userId);
    const balanceBefore = this.getCurrencyBalance(wallet, currency);
    const lockedBefore = this.getLockedBalance(wallet, currency);

    let balanceAfter = balanceBefore;
    let lockedAfter = lockedBefore;

    switch (type) {
      case TransactionType.deposit:
        balanceAfter = balanceBefore + amount;
        break;

      case TransactionType.withdrawal:
        if (balanceBefore < amount) throw new BadRequestException('Insufficient balance');
        balanceAfter = balanceBefore - amount;
        break;

      case TransactionType.withdrawal_hold:
        if (balanceBefore < amount) throw new BadRequestException('Insufficient balance');
        balanceAfter = balanceBefore - amount;
        lockedAfter = lockedBefore + amount;
        break;

      case TransactionType.withdrawal_payout:
        if (lockedBefore < amount) {
          throw new BadRequestException('Insufficient locked withdrawal funds');
        }
        lockedAfter = lockedBefore - amount;
        break;

      case TransactionType.bet:
        if (balanceBefore < amount) throw new BadRequestException('Insufficient balance');
        balanceAfter = balanceBefore - amount;
        lockedAfter = lockedBefore + amount;
        break;

      case TransactionType.win: {
        const unlockFromLocked =
          metadata?.unlockAmount != null ? Number(metadata.unlockAmount) : amount;
        balanceAfter = balanceBefore + amount;
        lockedAfter = Math.max(0, lockedBefore - unlockFromLocked);
        break;
      }

      case TransactionType.loss:
        lockedAfter = Math.max(0, lockedBefore - amount);
        break;

      case TransactionType.bonus:
        balanceAfter = balanceBefore + amount;
        break;

      case TransactionType.refund:
        balanceAfter = balanceBefore + amount;
        lockedAfter = Math.max(0, lockedBefore - amount);
        break;

      case TransactionType.commission:
        balanceAfter = balanceBefore + amount;
        break;

      case TransactionType.fee:
        if (balanceBefore < amount) throw new BadRequestException('Insufficient balance');
        balanceAfter = balanceBefore - amount;
        break;

      default:
        throw new BadRequestException(`Unsupported transaction type: ${type}`);
    }

    await db.wallet.update({
      where: { id: wallet.id },
      data: this.balanceUpdateData(currency, balanceAfter, lockedAfter),
    });

    return db.ledgerEntry.create({
      data: {
        userId,
        walletId: wallet.id,
        currency,
        amount,
        type,
        status: TransactionStatus.completed,
        referenceId,
        metadata: metadata ?? undefined,
        balanceBefore,
        balanceAfter,
      },
    });
  }

  async findLedgerEntry(referenceId: string, type: TransactionType | string): Promise<LedgerEntry | null> {
    return this.prisma.ledgerEntry.findFirst({
      where: { referenceId, type: type as TransactionType },
    });
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ entries: LedgerEntry[]; total: number }> {
    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.ledgerEntry.count({ where: { userId } }),
    ]);
    return { entries, total };
  }

  async getActiveBankAccounts() {
    return this.prisma.bankAccount.findMany({
      where: { status: BankAccountStatus.active },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDefaultActiveBankAccount() {
    const accounts = await this.getActiveBankAccounts();
    return accounts[0] ?? null;
  }

  async getFinancialReport(filters: {
    from?: string;
    to?: string;
    userId?: string;
  }): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    profitLoss: number;
  }> {
    const baseWhere: Prisma.LedgerEntryWhereInput = {
      status: TransactionStatus.completed,
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    };

    const sumByType = async (type: TransactionType | TransactionType[]) => {
      const types = Array.isArray(type) ? type : [type];
      const agg = await this.prisma.ledgerEntry.aggregate({
        where: { ...baseWhere, type: { in: types } },
        _sum: { amount: true },
      });
      return toNum(agg._sum.amount);
    };

    const [totalDeposits, totalWithdrawals, totalBets, totalWins, totalLosses] = await Promise.all([
      sumByType(TransactionType.deposit),
      sumByType([TransactionType.withdrawal, TransactionType.withdrawal_payout]),
      sumByType(TransactionType.bet),
      sumByType(TransactionType.win),
      sumByType(TransactionType.loss),
    ]);

    return {
      totalDeposits,
      totalWithdrawals,
      totalBets,
      totalWins,
      totalLosses,
      profitLoss: totalWins - totalLosses,
    };
  }
}
