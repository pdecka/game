export enum AdminAction {
  USER_SUSPEND = 'user_suspend',
  USER_UNSUSPEND = 'user_unsuspend',
  WALLET_CREDIT = 'wallet_credit',
  WALLET_DEBIT = 'wallet_debit',
  WITHDRAWAL_APPROVE = 'withdrawal_approve',
  WITHDRAWAL_REJECT = 'withdrawal_reject',
  KYC_APPROVE = 'kyc_approve',
  KYC_REJECT = 'kyc_reject',
  BONUS_CREATE = 'bonus_create',
  BONUS_CANCEL = 'bonus_cancel',
  GAME_RTP_UPDATE = 'game_rtp_update',
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetUserId?: string;
  details: Record<string, any>;
  ipAddress: string;
  createdAt: Date;
}

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  fraudAlerts: number;
}
