-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'support', 'finance', 'risk_manager', 'super_admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'kyc_pending', 'withdraw_locked', 'banned');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USDT', 'BTC');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'withdrawal_hold', 'withdrawal_payout', 'bet', 'win', 'loss', 'bonus', 'refund', 'commission', 'fee');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'processing');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('razorpay', 'cashfree', 'payu', 'bank_transfer', 'usdt', 'btc');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('deposit', 'withdrawal');

-- CreateEnum
CREATE TYPE "WithdrawalAccountType" AS ENUM ('bank', 'upi', 'crypto');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('dice', 'crash', 'mines', 'plinko', 'roulette', 'blackjack', 'baccarat', 'slots', 'wheel', 'tower', 'limbo', 'coinflip', 'keno', 'scratch', 'dragon_tiger', 'andar_bahar', 'video_poker', 'color_prediction', 'hilo', 'number_hilo', 'poker', 'tic_tac_toe', 'sports');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('welcome', 'deposit', 'cashback', 'free_spins', 'reload', 'vip');

-- CreateEnum
CREATE TYPE "BonusStatus" AS ENUM ('active', 'used', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('user_suspend', 'user_unsuspend', 'wallet_credit', 'wallet_debit', 'withdrawal_approve', 'withdrawal_reject', 'kyc_approve', 'kyc_reject', 'bonus_create', 'bonus_cancel', 'game_rtp_update');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "SportsMatchStatus" AS ENUM ('upcoming', 'live', 'finished', 'cancelled');

-- CreateEnum
CREATE TYPE "SportsBetType" AS ENUM ('match_winner', 'toss_winner', 'total_runs_over_under', 'over_under', 'first_goal');

-- CreateEnum
CREATE TYPE "SportsBetStatus" AS ENUM ('pending', 'won', 'lost', 'void');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read', 'archived');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "FraudFlagStatus" AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'pending',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" DATE,
    "address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "ipAddress" TEXT,
    "deviceFingerprint" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "referralCode" TEXT,
    "referredByUserId" TEXT,
    "affiliateRateOverride" DECIMAL(8,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inrBalance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "usdtBalance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "btcBalance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "inrLocked" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "usdtLocked" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "btcLocked" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalDepositedINR" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalDepositedUSDT" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalDepositedBTC" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWithdrawnINR" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWithdrawnUSDT" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWithdrawnBTC" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWageredINR" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWageredUSDT" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWageredBTC" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWonINR" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWonUSDT" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "totalWonBTC" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "referenceId" TEXT,
    "gameId" TEXT,
    "bonusId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "balanceBefore" DECIMAL(18,8),
    "balanceAfter" DECIMAL(18,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "purpose" "PaymentPurpose",
    "transactionId" TEXT,
    "clientReference" TEXT,
    "gatewayResponse" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_settings" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "network" TEXT,
    "displayName" TEXT,
    "depositAddress" TEXT,
    "upiId" TEXT,
    "qrImageUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WithdrawalAccountType" NOT NULL,
    "label" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'pending',
    "betAmount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "winAmount" DECIMAL(18,8),
    "result" JSONB,
    "serverSeed" TEXT,
    "clientSeed" TEXT,
    "nonce" INTEGER,
    "hash" TEXT,
    "ledgerEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_settings" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rtp" DECIMAL(6,4) NOT NULL DEFAULT 0.95,
    "houseEdge" DECIMAL(6,4) NOT NULL DEFAULT 0.05,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "minBet" DECIMAL(18,8) NOT NULL DEFAULT 1,
    "maxBet" DECIMAL(18,8) NOT NULL DEFAULT 100000,
    "maxWin" DECIMAL(18,8) NOT NULL DEFAULT 1000000,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "forceWin" BOOLEAN,
    "winChance" DECIMAL(6,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL DEFAULT 'pending',
    "documentType" TEXT,
    "documentNumber" TEXT,
    "frontImageUrl" TEXT,
    "backImageUrl" TEXT,
    "selfieImageUrl" TEXT,
    "metadata" JSONB,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetUserId" TEXT,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "upiId" TEXT,
    "qrImageUrl" TEXT,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_earnings" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "betAmount" DECIMAL(18,8) NOT NULL,
    "commissionAmount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_global" (
    "id" TEXT NOT NULL,
    "commissionRate" DECIMAL(12,8) NOT NULL DEFAULT 0.005,

    CONSTRAINT "affiliate_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BonusType" NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "wageringRequirement" DECIMAL(18,8) NOT NULL,
    "wageredAmount" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "maxWithdrawal" DECIMAL(18,8),
    "status" "BonusStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "BonusType" NOT NULL,
    "minDeposit" DECIMAL(18,8),
    "bonusAmount" DECIMAL(18,8),
    "bonusPercentage" DECIMAL(18,8),
    "wageringRequirement" DECIMAL(18,8) NOT NULL,
    "maxBonus" DECIMAL(18,8),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_bets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "externalMatchId" TEXT NOT NULL,
    "betType" "SportsBetType" NOT NULL,
    "selection" TEXT NOT NULL,
    "line" DECIMAL(10,2),
    "stake" DECIMAL(18,8) NOT NULL,
    "odds" DECIMAL(10,4) NOT NULL,
    "payoutAmount" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "SportsBetStatus" NOT NULL DEFAULT 'pending',
    "meta" JSONB,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_matches" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "teamAShort" TEXT,
    "teamBShort" TEXT,
    "startTime" TIMESTAMP(3),
    "status" "SportsMatchStatus" NOT NULL DEFAULT 'upcoming',
    "score" JSONB,
    "result" JSONB,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports_settings" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "houseEdge" DECIMAL(6,4) NOT NULL DEFAULT 0.05,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "target" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "minWagered" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "cashbackRate" DECIMAL(6,4) NOT NULL DEFAULT 0,
    "perks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT,
    "totalWagered" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "progressPct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_vip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsible_gambling_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyDeposit" DECIMAL(18,8),
    "weeklyDeposit" DECIMAL(18,8),
    "monthlyDeposit" DECIMAL(18,8),
    "dailyLoss" DECIMAL(18,8),
    "sessionMinutes" INTEGER,
    "selfExcludedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsible_gambling_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fairness_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "result" JSONB,
    "revealedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fairness_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_flags" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "reason" TEXT NOT NULL,
    "status" "FraudFlagStatus" NOT NULL DEFAULT 'open',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_blocks" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_rates" (
    "id" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "source" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currency_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_catalog_meta" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "tags" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_catalog_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "ledger_entries_userId_createdAt_idx" ON "ledger_entries"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ledger_entries_referenceId_idx" ON "ledger_entries"("referenceId");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");

-- CreateIndex
CREATE INDEX "payments_purpose_status_createdAt_idx" ON "payments"("purpose", "status", "createdAt");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payment_method_settings_purpose_enabled_idx" ON "payment_method_settings"("purpose", "enabled");

-- CreateIndex
CREATE INDEX "payment_method_settings_method_currency_idx" ON "payment_method_settings"("method", "currency");

-- CreateIndex
CREATE INDEX "withdrawal_accounts_userId_createdAt_idx" ON "withdrawal_accounts"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "games_gameType_key" ON "games"("gameType");

-- CreateIndex
CREATE INDEX "game_sessions_userId_createdAt_idx" ON "game_sessions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "game_settings_gameType_key" ON "game_settings"("gameType");

-- CreateIndex
CREATE INDEX "kyc_documents_userId_idx" ON "kyc_documents"("userId");

-- CreateIndex
CREATE INDEX "admin_logs_adminId_createdAt_idx" ON "admin_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "affiliate_earnings_referrerUserId_createdAt_idx" ON "affiliate_earnings"("referrerUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_earnings_referrerUserId_referredUserId_referenceI_key" ON "affiliate_earnings"("referrerUserId", "referredUserId", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "bonuses_userId_status_idx" ON "bonuses"("userId", "status");

-- CreateIndex
CREATE INDEX "sports_bets_userId_createdAt_idx" ON "sports_bets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "sports_bets_userId_status_idx" ON "sports_bets"("userId", "status");

-- CreateIndex
CREATE INDEX "sports_bets_matchId_status_idx" ON "sports_bets"("matchId", "status");

-- CreateIndex
CREATE INDEX "sports_matches_sport_status_idx" ON "sports_matches"("sport", "status");

-- CreateIndex
CREATE INDEX "sports_matches_startTime_idx" ON "sports_matches"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "sports_matches_sport_externalId_key" ON "sports_matches"("sport", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "sports_settings_sport_key" ON "sports_settings"("sport");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "otp_codes_target_purpose_idx" ON "otp_codes"("target", "purpose");

-- CreateIndex
CREATE INDEX "otp_codes_userId_idx" ON "otp_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vip_tiers_name_key" ON "vip_tiers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vip_tiers_level_key" ON "vip_tiers"("level");

-- CreateIndex
CREATE UNIQUE INDEX "user_vip_userId_key" ON "user_vip"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "responsible_gambling_limits_userId_key" ON "responsible_gambling_limits"("userId");

-- CreateIndex
CREATE INDEX "fairness_records_userId_createdAt_idx" ON "fairness_records"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "fairness_records_sessionId_idx" ON "fairness_records"("sessionId");

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "support_tickets_userId_status_idx" ON "support_tickets"("userId", "status");

-- CreateIndex
CREATE INDEX "fraud_flags_userId_idx" ON "fraud_flags"("userId");

-- CreateIndex
CREATE INDEX "fraud_flags_status_idx" ON "fraud_flags"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ip_blocks_ipAddress_key" ON "ip_blocks"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "currency_rates_base_quote_key" ON "currency_rates"("base", "quote");

-- CreateIndex
CREATE UNIQUE INDEX "game_catalog_meta_gameType_key" ON "game_catalog_meta"("gameType");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
