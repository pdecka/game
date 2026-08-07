export enum Currency {
  INR = 'INR',
  USDT = 'USDT',
  BTC = 'BTC',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  /** Funds moved from available balance into locked until withdrawal is approved or rejected. */
  WITHDRAWAL_HOLD = 'withdrawal_hold',
  /** Finalize an approved withdrawal that used WITHDRAWAL_HOLD (reduces locked only). */
  WITHDRAWAL_PAYOUT = 'withdrawal_payout',
  BET = 'bet',
  WIN = 'win',
  LOSS = 'loss',
  BONUS = 'bonus',
  REFUND = 'refund',
  COMMISSION = 'commission',
  FEE = 'fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
}

export interface Wallet {
  userId: string;
  balances: Record<Currency, number>;
  lockedBalances: Record<Currency, number>;
  totalDeposited: Record<Currency, number>;
  totalWithdrawn: Record<Currency, number>;
  totalWagered: Record<Currency, number>;
  totalWon: Record<Currency, number>;
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  currency: Currency;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceId?: string;
  gameId?: string;
  bonusId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionRequest {
  userId: string;
  currency: Currency;
  amount: number;
  type: TransactionType;
  referenceId?: string;
  metadata?: Record<string, any>;
}
