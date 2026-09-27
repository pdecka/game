import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentsService } from '../payments/payments.service';
import { AdminAction, Currency, PaymentStatus, TransactionType, UserRole, UserStatus } from '@gaming-platform/shared';
import { GameType } from '@gaming-platform/shared';
import { UpdateGameSettingDto } from './dto';
import { BankAccountStatus } from './bank-account.enums';
import { SportType } from '../sports/sports.enums';
import { AffiliateService } from '../affiliate/affiliate.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private usersService: UsersService,
    private walletService: WalletService,
    private paymentsService: PaymentsService,
    private affiliateService: AffiliateService,
  ) {}

  private async logAction(
    adminId: string,
    action: AdminAction,
    targetUserId: string | null,
    details: Record<string, any>,
    ipAddress: string,
  ) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: action as any,
        targetUserId,
        details,
        ipAddress,
      },
    });
  }

  async suspendUser(adminId: string, userId: string, reason: string, ipAddress: string) {
    await this.usersService.updateStatus(userId, UserStatus.SUSPENDED);
    await this.logAction(adminId, AdminAction.USER_SUSPEND, userId, { reason }, ipAddress);
  }

  async unsuspendUser(adminId: string, userId: string, ipAddress: string) {
    await this.usersService.updateStatus(userId, UserStatus.ACTIVE);
    await this.logAction(adminId, AdminAction.USER_UNSUSPEND, userId, {}, ipAddress);
  }

  async creditWallet(
    adminId: string,
    userId: string,
    amount: number,
    currency: Currency,
    reason: string,
    ipAddress: string,
  ) {
    await this.walletService.createTransaction(
      userId,
      currency,
      amount,
      TransactionType.DEPOSIT,
      undefined,
      { adminCredit: true, reason, adminId },
    );
    await this.logAction(adminId, AdminAction.WALLET_CREDIT, userId, { amount, currency, reason }, ipAddress);
  }

  async debitWallet(
    adminId: string,
    userId: string,
    amount: number,
    currency: Currency,
    reason: string,
    ipAddress: string,
  ) {
    await this.walletService.createTransaction(
      userId,
      currency,
      amount,
      TransactionType.WITHDRAWAL,
      undefined,
      { adminDebit: true, reason, adminId },
    );
    await this.logAction(adminId, AdminAction.WALLET_DEBIT, userId, { amount, currency, reason }, ipAddress);
  }

  async approveWithdrawal(
    adminId: string,
    paymentId: string,
    ipAddress: string,
    proof?: { payoutReference?: string; payoutScreenshotUrl?: string },
  ) {
    const payment = await this.paymentsService.approveWithdrawal(paymentId, proof);
    await this.logAction(adminId, AdminAction.WITHDRAWAL_APPROVE, payment.userId, { paymentId }, ipAddress);
    return payment;
  }

  async rejectWithdrawal(adminId: string, paymentId: string, reason: string, ipAddress: string) {
    const payment = await this.paymentsService.rejectWithdrawal(paymentId, reason);
    await this.logAction(adminId, AdminAction.WITHDRAWAL_REJECT, payment.userId, { paymentId, reason }, ipAddress);
    return payment;
  }

  async getDepositRequests(filters: {
    status?: PaymentStatus;
    userId?: string;
    username?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.paymentsService.listDepositRequests(filters);
  }

  async approveDeposit(adminId: string, paymentId: string, ipAddress: string) {
    const payment = await this.paymentsService.approveDeposit(paymentId);
    await this.logAction(
      adminId,
      AdminAction.WALLET_CREDIT,
      payment.userId,
      { paymentId, amount: payment.amount, currency: payment.currency },
      ipAddress,
    );
    return payment;
  }

  async rejectDeposit(adminId: string, paymentId: string, reason: string, ipAddress: string) {
    const payment = await this.paymentsService.rejectDeposit(paymentId, reason);
    await this.logAction(adminId, AdminAction.WITHDRAWAL_REJECT, payment.userId, { paymentId, reason }, ipAddress);
    return payment;
  }

  async recoverWalletTransaction(adminId: string, paymentId: string, ipAddress: string) {
    console.log(`AdminService.recoverWalletTransaction: adminId=${adminId}, paymentId=${paymentId}`);

    // Get the payment
    const payment = await this.paymentsService.getPaymentById(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment must be completed before wallet recovery');
    }

    const meta = (payment.metadata ?? {}) as Record<string, any>;
    if (!meta.walletTransactionFailed) {
      throw new BadRequestException('No wallet transaction failure detected');
    }
    
    // Check if wallet transaction already exists
    const existingLedger = await this.walletService.findLedgerEntry(paymentId, TransactionType.DEPOSIT);
    if (existingLedger) {
      throw new BadRequestException('Wallet transaction already exists');
    }
    
    // Create the missing wallet transaction
    try {
      await this.walletService.createTransaction(
        payment.userId,
        payment.currency as any,
        Number(payment.amount),
        TransactionType.DEPOSIT,
        payment.id,
        {
          paymentPurpose: 'deposit',
          adminRecovery: true,
          recoveredAt: new Date().toISOString(),
          originalError: meta.walletError,
        },
      );
      
      // Update payment metadata to mark recovery
      payment.metadata = {
        ...meta,
        walletTransactionRecovered: true,
        walletTransactionFailed: false,
        recoveredAt: new Date().toISOString(),
      };

      await this.paymentsService.updatePayment(payment);

      // Log the recovery action
      await this.logAction(
        adminId,
        AdminAction.WALLET_CREDIT,
        payment.userId,
        {
          paymentId,
          amount: payment.amount,
          currency: payment.currency,
          recovery: true,
        },
        ipAddress,
      );

      return { success: true, message: 'Wallet transaction recovered successfully' };
    } catch (error) {
      console.error('Wallet recovery failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Wallet recovery failed: ${errorMessage}`);
    }
  }

  async getWithdrawalRequests(filters: {
    status?: PaymentStatus;
    userId?: string;
    username?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.paymentsService.listWithdrawalRequests(filters);
  }

  async getUsers() {
    const allUsers = await this.usersService.findAll();

    // Keep admin panel focused on player accounts.
    const playerUsers = allUsers.filter((u) => u.role === UserRole.USER);

    const usersWithWallet = await Promise.all(
      playerUsers.map(async (u) => {
        const balanceINR = await this.walletService.getBalance(u.id, Currency.INR);
        return {
          id: u.id,
          username: u.username,
          mobile: u.phone || null,
          balanceINR,
          createdAt: u.createdAt,
          status: u.status,
        };
      }),
    );

    return usersWithWallet;
  }

  async getGameSettings() {
    const existing = await this.prisma.gameSetting.findMany();

    // Ensure all known games have a default setting row.
    const allGameTypes = Object.values(GameType);
    const missing = allGameTypes.filter((gt) => !existing.some((s) => s.gameType === gt));

    if (missing.length > 0) {
      await this.prisma.gameSetting.createMany({
        data: missing.map((gt) => ({
          gameType: gt as any,
          enabled: true,
          rtp: 0.95,
          houseEdge: 0.05,
          currency: Currency.INR as any,
          minBet: 1,
          maxBet: 100000,
          maxWin: 1000000,
          manualOverride: false,
          forceWin: null,
          winChance: null,
        })),
      });
      return this.prisma.gameSetting.findMany();
    }

    return existing;
  }

  async upsertGameSetting(dto: UpdateGameSettingDto) {
    const existing = await this.prisma.gameSetting.findUnique({ where: { gameType: dto.gameType as any } });
    
    // Merge existing metadata with new metadata for game-specific settings
    const existingMetadata = existing?.metadata as Record<string, any> || {};
    const newMetadata = dto.metadata as Record<string, any> || {};
    const mergedMetadata = { ...existingMetadata, ...newMetadata };

    if (!existing) {
      return this.prisma.gameSetting.create({
        data: {
          gameType: dto.gameType as any,
          enabled: dto.enabled ?? true,
          rtp: (dto.rtp as any) ?? 0.95,
          houseEdge: (dto.houseEdge as any) ?? 0.05,
          currency: (dto.currency ?? Currency.INR) as any,
          minBet: (dto.minBet as any) ?? 1,
          maxBet: (dto.maxBet as any) ?? 100000,
          maxWin: (dto.maxWin as any) ?? 1000000,
          manualOverride: dto.manualOverride ?? false,
          forceWin: dto.forceWin ?? null,
          winChance: dto.winChance ?? null,
          metadata: mergedMetadata,
        },
      });
    }

    return this.prisma.gameSetting.update({
      where: { id: existing.id },
      data: {
        enabled: dto.enabled ?? existing.enabled,
        rtp: (dto.rtp as any) ?? existing.rtp,
        houseEdge: (dto.houseEdge as any) ?? existing.houseEdge,
        currency: (dto.currency ?? existing.currency) as any,
        minBet: (dto.minBet as any) ?? existing.minBet,
        maxBet: (dto.maxBet as any) ?? existing.maxBet,
        maxWin: (dto.maxWin as any) ?? existing.maxWin,
        manualOverride: dto.manualOverride ?? existing.manualOverride,
        forceWin: dto.forceWin ?? existing.forceWin,
        winChance: dto.winChance ?? existing.winChance,
        metadata: mergedMetadata,
      },
    });
  }

  async getDashboard(filters?: { from?: string; to?: string }) {
    const financial = await this.walletService.getFinancialReport({
      from: filters?.from,
      to: filters?.to,
    });
    const allUsers = await this.usersService.findAll();
    const players = allUsers.filter((u) => u.role === UserRole.USER);
    const activeUsers = players.filter((u) => u.status === UserStatus.ACTIVE).length;
    const pendingKYC = players.filter((u) => u.status === UserStatus.KYC_PENDING).length;
    const [pendingDeposits, pendingWithdrawals] = await Promise.all([
      this.paymentsService.countPendingDeposits(),
      this.paymentsService.countPendingWithdrawals(),
    ]);

    return {
      totalUsers: players.length,
      activeUsers,
      totalDeposits: financial.totalDeposits,
      totalWithdrawals: financial.totalWithdrawals,
      totalBets: financial.totalBets,
      totalWins: financial.totalWins,
      totalLosses: financial.totalLosses,
      profitLoss: financial.profitLoss,
      pendingDeposits,
      pendingWithdrawals,
      pendingKYC,
      fraudAlerts: 0,
    };
  }

  async getAffiliateOverview() {
    return this.affiliateService.adminOverview();
  }

  async setAffiliateGlobalRate(rate: number) {
    return this.affiliateService.setGlobalRate(rate);
  }

  async setUserAffiliateRateOverride(userId: string, rate: number | null) {
    return this.usersService.update(userId, {
      affiliateRateOverride: rate == null ? (null as any) : (rate as any),
    });
  }

  async listBankAccounts() {
    return this.prisma.bankAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async upsertBankAccount(dto: {
    id?: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    upiId?: string;
    qrImageUrl?: string;
    status?: BankAccountStatus;
  }) {
    if (dto.id) {
      const existing = await this.prisma.bankAccount.findUnique({ where: { id: dto.id } });
      if (!existing) throw new Error('Bank account not found');
      return this.prisma.bankAccount.update({
        where: { id: existing.id },
        data: {
          bankName: dto.bankName,
          accountHolder: dto.accountHolder,
          accountNumber: dto.accountNumber,
          ifsc: dto.ifsc,
          upiId: dto.upiId ?? existing.upiId ?? null,
          qrImageUrl: dto.qrImageUrl ?? existing.qrImageUrl ?? null,
          status: (dto.status ?? existing.status ?? BankAccountStatus.ACTIVE) as any,
        },
      });
    }

    return this.prisma.bankAccount.create({
      data: {
        bankName: dto.bankName,
        accountHolder: dto.accountHolder,
        accountNumber: dto.accountNumber,
        ifsc: dto.ifsc,
        upiId: dto.upiId ?? null,
        qrImageUrl: dto.qrImageUrl ?? null,
        status: (dto.status ?? BankAccountStatus.ACTIVE) as any,
      },
    });
  }

  async listPaymentMethodSettings() {
    return this.paymentsService.adminListMethodSettings();
  }

  async upsertPaymentMethodSetting(payload: {
    purpose: 'deposit' | 'withdrawal';
    method: string;
    currency: string;
    network?: string;
    displayName?: string;
    depositAddress?: string;
    upiId?: string;
    qrImageUrl?: string;
    enabled?: boolean;
    metadata?: Record<string, any>;
  }) {
    return this.paymentsService.adminUpsertMethodSetting(payload);
  }

  async getFinancialReport(filters: { from?: string; to?: string; userId?: string }) {
    return this.walletService.getFinancialReport(filters);
  }

  async getSportsSettings() {
    return this.prisma.sportsSetting.findMany({ orderBy: { sport: 'asc' } });
  }

  async updateSportsSetting(sport: SportType, patch: { enabled?: boolean; houseEdge?: number }) {
    const current = await this.prisma.sportsSetting.findUnique({ where: { sport } });
    if (!current) throw new Error('Sports setting not found');
    return this.prisma.sportsSetting.update({
      where: { id: current.id },
      data: {
        ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
        ...(typeof patch.houseEdge === 'number' ? { houseEdge: patch.houseEdge } : {}),
      },
    });
  }
}
