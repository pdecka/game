export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPPORT = 'support',
  FINANCE = 'finance',
  RISK_MANAGER = 'risk_manager',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  KYC_PENDING = 'kyc_pending',
  WITHDRAW_LOCKED = 'withdraw_locked',
  BANNED = 'banned',
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  ipAddress?: string;
  deviceFingerprint?: string;
}

export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  address?: string;
  country?: string;
  city?: string;
  postalCode?: string;
}
