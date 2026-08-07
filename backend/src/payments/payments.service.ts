import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { Payment, PaymentMethodSetting, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RazorpayService } from './razorpay.service';
import { CryptoService } from './crypto.service';
import { PaymentMethod, PaymentStatus, Currency, TransactionType } from '@gaming-platform/shared';
import { UsersService } from '../users/users.service';

enum PaymentPurpose {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private walletService: WalletService,
    private razorpayService: RazorpayService,
    private cryptoService: CryptoService,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    const defaults: Array<Partial<PaymentMethodSetting> & {
      purpose: string;
      method: string;
      currency: string;
      displayName: string;
      enabled: boolean;
      network?: string;
    }> = [
      { purpose: 'deposit', method: PaymentMethod.BANK_TRANSFER, currency: Currency.INR, displayName: 'INR Bank Transfer', enabled: true },
      { purpose: 'deposit', method: PaymentMethod.USDT, currency: Currency.USDT, network: 'TRC20', displayName: 'USDT (TRC20)', enabled: true },
      { purpose: 'deposit', method: PaymentMethod.BTC, currency: Currency.BTC, network: 'BTC', displayName: 'Bitcoin', enabled: true },
      { purpose: 'withdrawal', method: PaymentMethod.BANK_TRANSFER, currency: Currency.INR, displayName: 'INR Bank Transfer', enabled: true },
      { purpose: 'withdrawal', method: PaymentMethod.USDT, currency: Currency.USDT, network: 'TRC20', displayName: 'USDT (TRC20)', enabled: true },
      { purpose: 'withdrawal', method: PaymentMethod.BTC, currency: Currency.BTC, network: 'BTC', displayName: 'Bitcoin', enabled: true },
    ];
    for (const d of defaults) {
      const where: Prisma.PaymentMethodSettingWhereInput = {
        purpose: d.purpose,
        method: d.method,
        currency: d.currency,
      };
      if (d.network !== undefined) {
        where.network = d.network;
      }
      const exists = await this.prisma.paymentMethodSetting.findFirst({ where });
      if (!exists) {
        await this.prisma.paymentMethodSetting.create({
          data: {
            purpose: d.purpose,
            method: d.method,
            currency: d.currency,
            network: d.network ?? null,
            displayName: d.displayName,
            enabled: d.enabled,
          },
        });
      }
    }
  }

  async countPendingDeposits(): Promise<number> {
    return this.prisma.payment.count({
      where: { purpose: PaymentPurpose.DEPOSIT as any, status: PaymentStatus.PENDING as any },
    });
  }

  async countPendingWithdrawals(): Promise<number> {
    return this.prisma.payment.count({
      where: { purpose: PaymentPurpose.WITHDRAWAL as any, status: PaymentStatus.PENDING as any },
    });
  }

  private normalizeClientReference(raw?: string | null): string | null {
    if (!raw || typeof raw !== 'string') return null;
    const s = raw.replace(/\s+/g, '').toUpperCase();
    return s.length ? s : null;
  }

  private async persistPayment(payment: Payment): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method as any,
        status: payment.status as any,
        purpose: (payment.purpose ?? null) as any,
        transactionId: payment.transactionId ?? null,
        clientReference: payment.clientReference ?? null,
        gatewayResponse: (payment.gatewayResponse ?? Prisma.JsonNull) as any,
        metadata: (payment.metadata ?? Prisma.JsonNull) as any,
      },
    });
  }

  async listDepositMethodSettings() {
    const rows = await this.prisma.paymentMethodSetting.findMany({
      where: { purpose: 'deposit', enabled: true },
      orderBy: [{ currency: 'asc' }, { method: 'asc' }, { network: 'asc' }],
    });
    return rows;
  }

  async adminListMethodSettings() {
    return this.prisma.paymentMethodSetting.findMany({
      orderBy: [{ purpose: 'asc' }, { currency: 'asc' }, { method: 'asc' }, { network: 'asc' }],
    });
  }

  async adminUpsertMethodSetting(payload: Partial<PaymentMethodSetting> & { purpose: 'deposit' | 'withdrawal'; method: string; currency: string }) {
    const existing = await this.prisma.paymentMethodSetting.findFirst({
      where: {
        purpose: payload.purpose,
        method: payload.method,
        currency: payload.currency,
        network: payload.network ?? null,
      },
    });
    if (existing) {
      return this.prisma.paymentMethodSetting.update({
        where: { id: existing.id },
        data: {
          purpose: payload.purpose ?? existing.purpose,
          method: payload.method ?? existing.method,
          currency: payload.currency ?? existing.currency,
          network: payload.network !== undefined ? payload.network : existing.network,
          displayName: payload.displayName !== undefined ? payload.displayName : existing.displayName,
          depositAddress: payload.depositAddress !== undefined ? payload.depositAddress : existing.depositAddress,
          upiId: payload.upiId !== undefined ? payload.upiId : existing.upiId,
          qrImageUrl: payload.qrImageUrl !== undefined ? payload.qrImageUrl : existing.qrImageUrl,
          enabled: payload.enabled !== undefined ? payload.enabled : existing.enabled,
          metadata: payload.metadata !== undefined ? (payload.metadata as any) : (existing.metadata as any),
        },
      });
    }
    return this.prisma.paymentMethodSetting.create({
      data: {
        purpose: payload.purpose,
        method: payload.method,
        currency: payload.currency,
        network: payload.network ?? null,
        displayName: payload.displayName ?? null,
        depositAddress: payload.depositAddress ?? null,
        upiId: payload.upiId ?? null,
        qrImageUrl: payload.qrImageUrl ?? null,
        enabled: payload.enabled ?? true,
        metadata: (payload.metadata as any) ?? undefined,
      },
    });
  }

  async listWithdrawalAccounts(userId: string) {
    return this.prisma.withdrawalAccount.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addWithdrawalAccount(
    userId: string,
    payload: { type: 'bank' | 'upi' | 'crypto'; label: string; details: Record<string, any>; isDefault?: boolean },
  ) {
    if (!payload?.label?.trim()) throw new BadRequestException('Account label is required');
    if (!payload?.details || typeof payload.details !== 'object') throw new BadRequestException('Account details are required');
    if (payload.isDefault) {
      await this.prisma.withdrawalAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.withdrawalAccount.create({
      data: {
        userId,
        type: payload.type as any,
        label: payload.label.trim(),
        details: payload.details as any,
        isDefault: !!payload.isDefault,
      },
    });
  }

  async createDeposit(
    userId: string,
    amount: number,
    currency: Currency,
    method: PaymentMethod,
    metadata?: Record<string, any>,
  ): Promise<Payment> {
    const methodEnabled = await this.prisma.paymentMethodSetting.findFirst({
      where: { purpose: 'deposit', method: method as any, currency: currency as any, enabled: true } as any,
    });
    if (!methodEnabled) {
      throw new BadRequestException('This deposit method is currently disabled');
    }

    if (currency === Currency.INR || method === PaymentMethod.BANK_TRANSFER) {
      if (!metadata?.reference) {
        throw new BadRequestException('UTR / reference is required for INR deposit');
      }
      if (!metadata?.screenshotUrl) {
        throw new BadRequestException('Payment screenshot URL is required for INR deposit');
      }
    }

    if (method === PaymentMethod.USDT || method === PaymentMethod.BTC) {
      if (!metadata?.txHash) {
        throw new BadRequestException('Transaction hash is required for crypto deposit');
      }
      const txHashNorm = String(metadata.txHash).trim().toLowerCase();
      const candidates = await this.prisma.payment.findMany({
        where: {
          purpose: PaymentPurpose.DEPOSIT as any,
          method: method as any,
        },
      });
      const dupHash = candidates.find((p) => {
        const hash = (p.metadata as any)?.txHash;
        return hash != null && String(hash).trim().toLowerCase() === txHashNorm;
      });
      if (dupHash && dupHash.status !== PaymentStatus.FAILED && dupHash.status !== PaymentStatus.CANCELLED) {
        throw new BadRequestException('This transaction hash is already submitted');
      }
    }

    const ref = this.normalizeClientReference(metadata?.reference ?? metadata?.utr);
    if (ref) {
      const dup = await this.prisma.payment.findFirst({
        where: { purpose: PaymentPurpose.DEPOSIT as any, clientReference: ref },
      });
      if (dup && dup.status !== PaymentStatus.FAILED && dup.status !== PaymentStatus.CANCELLED) {
        throw new BadRequestException('This reference / UTR is already submitted');
      }
    }

    let savedPayment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        method: method as any,
        status: PaymentStatus.PENDING as any,
        purpose: PaymentPurpose.DEPOSIT as any,
        clientReference: ref ?? null,
        metadata: (metadata ?? {}) as any,
      },
    });

    if (method === PaymentMethod.RAZORPAY && currency === Currency.INR) {
      const order = await this.razorpayService.createOrder(amount, savedPayment.id);
      savedPayment = await this.prisma.payment.update({
        where: { id: savedPayment.id },
        data: {
          transactionId: order.id,
          gatewayResponse: order as any,
        },
      });
    } else if (method === PaymentMethod.USDT || method === PaymentMethod.BTC) {
      const address = await this.cryptoService.generateDepositAddress(userId, savedPayment.id);
      savedPayment = await this.prisma.payment.update({
        where: { id: savedPayment.id },
        data: {
          metadata: { ...((savedPayment.metadata as any) ?? {}), address } as any,
        },
      });
    } else if (method === PaymentMethod.BANK_TRANSFER) {
      savedPayment = await this.prisma.payment.update({
        where: { id: savedPayment.id },
        data: {
          metadata: {
            ...((savedPayment.metadata as any) ?? {}),
            reference: metadata?.reference ?? ref,
          } as any,
        },
      });
    }

    return savedPayment;
  }

  async verifyDeposit(paymentId: string, gatewayData: any): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId } });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    let verified = false;

    if (payment.method === PaymentMethod.RAZORPAY) {
      verified = await this.razorpayService.verifyPayment(payment.transactionId, gatewayData);
    } else if (payment.method === PaymentMethod.USDT || payment.method === PaymentMethod.BTC) {
      verified = await this.cryptoService.verifyTransaction(payment.transactionId, Number(payment.amount));
    }

    if (verified) {
      const done = await this.approveDeposit(paymentId);
      return done;
    }

    return payment;
  }

  async createWithdrawal(
    userId: string,
    amount: number,
    currency: Currency,
    method: PaymentMethod,
    address?: string,
    accountDetails?: Record<string, any>,
    accountId?: string,
  ): Promise<Payment> {
    const methodEnabled = await this.prisma.paymentMethodSetting.findFirst({
      where: { purpose: 'withdrawal', method: method as any, currency: currency as any, enabled: true } as any,
    });
    if (!methodEnabled) {
      throw new BadRequestException('This withdrawal method is currently disabled');
    }

    const numAmount = Number(amount);
    if (currency === Currency.INR) {
      const min = Number(process.env.WITHDRAW_MIN_INR ?? 100);
      const max = Number(process.env.WITHDRAW_MAX_INR ?? 500000);
      if (numAmount < min || numAmount > max) {
        throw new BadRequestException(`Withdrawal must be between ${min} and ${max} INR`);
      }
    }

    const available = await this.walletService.getAvailableBalance(userId, currency);
    if (available < numAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      let resolvedAccountDetails = accountDetails ?? undefined;
      let resolvedAddress = address;
      if (accountId) {
        const acc = await tx.withdrawalAccount.findFirst({ where: { id: accountId, userId } });
        if (!acc) throw new BadRequestException('Withdrawal account not found');
        if (acc.type === 'crypto') {
          resolvedAddress = String((acc.details as any)?.address ?? '');
        } else {
          resolvedAccountDetails = { ...((acc.details as any) ?? {}), label: acc.label, type: acc.type };
        }
      }

      const payment = await tx.payment.create({
        data: {
          userId,
          amount: numAmount,
          currency,
          method: method as any,
          status: PaymentStatus.PENDING as any,
          purpose: PaymentPurpose.WITHDRAWAL as any,
          metadata: {
            address: resolvedAddress,
            accountDetails: resolvedAccountDetails,
            withdrawalHold: true,
            accountId: accountId ?? null,
          } as any,
        },
      });

      await this.walletService.createTransaction(
        userId,
        currency,
        numAmount,
        TransactionType.WITHDRAWAL_HOLD,
        payment.id,
        { withdrawalHold: true },
        tx,
      );

      return tx.payment.update({
        where: { id: payment.id },
        data: {
          metadata: { ...((payment.metadata as any) ?? {}), withdrawalHold: true } as any,
        },
      });
    });
  }

  async approveWithdrawal(paymentId: string, adminProof?: { payoutReference?: string; payoutScreenshotUrl?: string }): Promise<Payment> {
    let payment = await this.prisma.payment.findFirst({ where: { id: paymentId } });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const hold = (payment.metadata as any)?.withdrawalHold === true;

    if (hold) {
      if (payment.status === PaymentStatus.COMPLETED) {
        return payment;
      }
      const paidOut = await this.prisma.ledgerEntry.findFirst({
        where: { referenceId: paymentId, type: TransactionType.WITHDRAWAL_PAYOUT as any },
      });
      if (paidOut) {
        payment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED as any },
        });
        return payment;
      }
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Withdrawal cannot be approved in this state');
      }

      if (
        payment.method === PaymentMethod.BANK_TRANSFER &&
        (!adminProof?.payoutReference || !adminProof?.payoutScreenshotUrl)
      ) {
        throw new BadRequestException('Admin payout reference and screenshot are required to approve INR withdrawal');
      }

      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PROCESSING as any },
      });

      let processed = false;
      if (
        payment.method === PaymentMethod.BANK_TRANSFER ||
        payment.method === PaymentMethod.CASHFREE ||
        payment.method === PaymentMethod.PAYU
      ) {
        processed = true;
      } else if (payment.method === PaymentMethod.RAZORPAY) {
        processed = await this.razorpayService.processPayout(payment);
      } else if (payment.method === PaymentMethod.USDT || payment.method === PaymentMethod.BTC) {
        processed = await this.cryptoService.processWithdrawal(payment);
      }

      if (processed) {
        payment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            metadata: {
              ...((payment.metadata as any) ?? {}),
              adminPayout: {
                reference: adminProof?.payoutReference ?? null,
                screenshotUrl: adminProof?.payoutScreenshotUrl ?? null,
                approvedAt: new Date().toISOString(),
              },
            } as any,
            status: PaymentStatus.COMPLETED as any,
          },
        });

        await this.walletService.createTransaction(
          payment.userId,
          payment.currency as Currency,
          Number(payment.amount),
          TransactionType.WITHDRAWAL_PAYOUT,
          payment.id,
          { withdrawalPayout: true },
        );
      } else {
        payment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED as any },
        });

        await this.walletService.createTransaction(
          payment.userId,
          payment.currency as Currency,
          Number(payment.amount),
          TransactionType.REFUND,
          payment.id,
          { withdrawalPayoutFailed: true },
        );
      }

      return payment;
    }

    // Legacy withdrawals (no hold): debit available balance on approval only.
    payment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PROCESSING as any },
    });

    let processed = false;
    if (payment.method === PaymentMethod.RAZORPAY) {
      processed = await this.razorpayService.processPayout(payment);
    } else if (payment.method === PaymentMethod.USDT || payment.method === PaymentMethod.BTC) {
      processed = await this.cryptoService.processWithdrawal(payment);
    }

    if (processed) {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED as any },
      });

      await this.walletService.createTransaction(
        payment.userId,
        payment.currency as Currency,
        Number(payment.amount),
        TransactionType.WITHDRAWAL,
        payment.id,
      );
    } else {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED as any },
      });
    }

    return payment;
  }

  private async buildPaymentListWhere(
    purpose: PaymentPurpose,
    filters: {
      status?: PaymentStatus;
      userId?: string;
      username?: string;
      from?: string;
      to?: string;
    },
  ): Promise<Prisma.PaymentWhereInput | null> {
    const where: Prisma.PaymentWhereInput = {
      purpose: purpose as any,
    };

    if (filters.status) where.status = filters.status as any;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    if (filters.username) {
      const users = await this.prisma.user.findMany({
        where: {
          username: { contains: filters.username },
          ...(filters.userId ? { id: filters.userId } : {}),
        },
        select: { id: true },
      });
      if (users.length === 0) return null;
      where.userId = { in: users.map((u) => u.id) };
    } else if (filters.userId) {
      where.userId = filters.userId;
    }

    return where;
  }

  async listDepositRequests(filters: {
    status?: PaymentStatus;
    userId?: string;
    username?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: any[]; total: number }> {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const where = await this.buildPaymentListWhere(PaymentPurpose.DEPOSIT, filters);
    if (!where) return { items: [], total: 0 };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);

    const items = await Promise.all(
      payments.map(async (p) => {
        const user = await this.usersService.findOne(p.userId);
        const meta = (p.metadata as any) ?? {};
        const ref = p.clientReference ?? meta?.reference ?? meta?.utr ?? null;
        return {
          id: p.id,
          userId: p.userId,
          username: user.username,
          email: user.email,
          mobile: user.phone ?? null,
          amount: p.amount,
          currency: p.currency,
          method: p.method,
          status: p.status,
          reference: ref,
          clientReference: p.clientReference ?? null,
          accountDetails: meta?.accountDetails ?? null,
          screenshotUrl: meta?.screenshotUrl ?? null,
          txHash: meta?.txHash ?? null,
          network: meta?.network ?? null,
          transactionId: p.transactionId ?? null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
    );

    return { items, total };
  }

  async listWithdrawalRequests(filters: {
    status?: PaymentStatus;
    userId?: string;
    username?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: any[]; total: number }> {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const where = await this.buildPaymentListWhere(PaymentPurpose.WITHDRAWAL, filters);
    if (!where) return { items: [], total: 0 };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);

    const items = await Promise.all(
      payments.map(async (p) => {
        const user = await this.usersService.findOne(p.userId);
        const meta = (p.metadata as any) ?? {};
        return {
          id: p.id,
          userId: p.userId,
          username: user.username,
          mobile: user.phone ?? null,
          amount: p.amount,
          currency: p.currency,
          method: p.method,
          status: p.status,
          reference: meta?.reference ?? meta?.utr ?? null,
          bank: meta?.accountDetails ?? null,
          address: meta?.address ?? null,
          payoutReference: meta?.adminPayout?.reference ?? null,
          payoutScreenshotUrl: meta?.adminPayout?.screenshotUrl ?? null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
    );

    return { items, total };
  }

  async rejectDeposit(paymentId: string, _reason?: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status === PaymentStatus.COMPLETED) return payment;

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED as any },
    });
  }

  async approveDeposit(paymentId: string): Promise<Payment> {
    console.log('=== APPROVE DEPOSIT START ===');
    console.log('Payment ID:', paymentId);

    try {
      // Step 1: Find and validate payment
      let payment = await this.prisma.payment.findFirst({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      console.log('Payment found:', {
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        purpose: payment.purpose,
      });

      // Handle legacy deposits
      if (payment.purpose && payment.purpose !== PaymentPurpose.DEPOSIT) {
        throw new BadRequestException('Not a deposit request');
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        console.log('Payment already completed');
        return payment;
      }

      // Step 2: Check for duplicate ledger entries
      const existingLedger = await this.prisma.ledgerEntry.findFirst({
        where: { referenceId: paymentId, type: TransactionType.DEPOSIT as any },
      });

      if (existingLedger) {
        console.log('Ledger entry already exists, just completing payment');
        payment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED as any,
            purpose: payment.purpose ? undefined : (PaymentPurpose.DEPOSIT as any),
          },
        });
        return payment;
      }

      // Step 3: Create wallet transaction with detailed logging
      console.log('Creating wallet transaction...');
      try {
        await this.walletService.createTransaction(
          payment.userId,
          payment.currency as Currency,
          Number(payment.amount),
          TransactionType.DEPOSIT,
          payment.id,
          {
            paymentPurpose: PaymentPurpose.DEPOSIT,
            adminApproved: true,
            approvedAt: new Date().toISOString(),
            originalAmount: payment.amount,
            originalCurrency: payment.currency,
          },
        );
        console.log('Wallet transaction created successfully');
      } catch (walletError) {
        console.error('Wallet transaction failed:', walletError);

        // Don't fail the entire approval if wallet fails, but log it
        // This allows manual recovery later
        console.warn('Payment approved but wallet transaction failed - manual intervention may be required');

        // Still mark payment as completed but add metadata about the wallet issue
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED as any,
            purpose: payment.purpose ? undefined : (PaymentPurpose.DEPOSIT as any),
            metadata: {
              ...((payment.metadata as any) ?? {}),
              walletTransactionFailed: true,
              walletError: walletError.message,
              requiresManualIntervention: true,
            } as any,
          },
        });
        console.log('Payment marked as completed with wallet error noted');
        return updatedPayment;
      }

      // Step 4: Update payment status
      console.log('Updating payment status to completed...');
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED as any,
          purpose: payment.purpose ? undefined : (PaymentPurpose.DEPOSIT as any),
          metadata: {
            ...((payment.metadata as any) ?? {}),
            walletTransactionSuccess: true,
            completedAt: new Date().toISOString(),
          } as any,
        },
      });
      console.log('=== APPROVE DEPOSIT SUCCESS ===');
      return updatedPayment;
    } catch (error) {
      console.error('=== APPROVE DEPOSIT ERROR ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');
    return payment;
  }

  async updatePayment(payment: Payment): Promise<Payment> {
    return this.persistPayment(payment);
  }

  async rejectWithdrawal(paymentId: string, _reason?: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId } });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status === PaymentStatus.COMPLETED) return payment;

    if (
      (payment.metadata as any)?.withdrawalHold === true &&
      payment.status !== PaymentStatus.FAILED &&
      payment.status !== PaymentStatus.CANCELLED
    ) {
      const refunded = await this.prisma.ledgerEntry.findFirst({
        where: { referenceId: paymentId, type: TransactionType.REFUND as any },
      });
      if (!refunded) {
        await this.walletService.createTransaction(
          payment.userId,
          payment.currency as Currency,
          Number(payment.amount),
          TransactionType.REFUND,
          payment.id,
          { withdrawalRejected: true },
        );
      }
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED as any },
    });
  }
}
