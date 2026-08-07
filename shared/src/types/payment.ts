export enum PaymentMethod {
  RAZORPAY = 'razorpay',
  CASHFREE = 'cashfree',
  PAYU = 'payu',
  /** Manual bank transfer — user pays admin bank; admin confirms in panel. */
  BANK_TRANSFER = 'bank_transfer',
  USDT = 'usdt',
  BTC = 'btc',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepositRequest {
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  address?: string; // For crypto
  accountDetails?: Record<string, any>; // For INR
}
