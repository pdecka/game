export enum BonusType {
  WELCOME = 'welcome',
  DEPOSIT = 'deposit',
  CASHBACK = 'cashback',
  FREE_SPINS = 'free_spins',
  RELOAD = 'reload',
  VIP = 'vip',
}

export enum BonusStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface Bonus {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  currency: string;
  wageringRequirement: number;
  wageredAmount: number;
  maxWithdrawal?: number;
  status: BonusStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: BonusType;
  minDeposit?: number;
  bonusAmount?: number;
  bonusPercentage?: number;
  wageringRequirement: number;
  maxBonus?: number;
  active: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}
