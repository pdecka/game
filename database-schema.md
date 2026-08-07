# Database Schema - Casino + Sportsbook Platform

## PostgreSQL Production Ready Schema (pgAdmin Ready)

```sql
-- =========================================================
-- CASINO + SPORTSBOOK PLATFORM
-- PostgreSQL Production Ready Schema (pgAdmin Ready)
-- Run in pgAdmin Query Tool
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- SAFE DROP ORDER (optional for fresh install)
-- =========================================================

DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS affiliate_referrals CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS sports_bet_items CASCADE;
DROP TABLE IF EXISTS sports_betslips CASCADE;
DROP TABLE IF EXISTS odds_selections CASCADE;
DROP TABLE IF EXISTS odds_markets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS game_rounds CASCADE;
DROP TABLE IF EXISTS provably_fair_seeds CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vip_levels CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;

-- =========================================================
-- MASTER TABLES
-- =========================================================

CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimals INT DEFAULT 2,
    conversion_rate DECIMAL(20,8) DEFAULT 1,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vip_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_name VARCHAR(50) UNIQUE NOT NULL,
    min_points INT DEFAULT 0,
    cashback_percentage DECIMAL(5,2) DEFAULT 0,
    withdrawal_limit DECIMAL(20,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    vip_level_id UUID REFERENCES vip_levels(id) ON DELETE SET NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    email_verified_at TIMESTAMP,
    mobile_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip INET,
    country VARCHAR(100),
    currency_id UUID REFERENCES currencies(id),
    is_banned BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    wallet_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency_id UUID REFERENCES currencies(id),
    main_balance DECIMAL(24,8) DEFAULT 0,
    bonus_balance DECIMAL(24,8) DEFAULT 0,
    locked_balance DECIMAL(24,8) DEFAULT 0,
    wagering_balance DECIMAL(24,8) DEFAULT 0,
    sportsbook_locked_balance DECIMAL(24,8) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    tx_type VARCHAR(30) NOT NULL,
    amount DECIMAL(24,8) NOT NULL,
    before_balance DECIMAL(24,8) NOT NULL,
    after_balance DECIMAL(24,8) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    txn_hash VARCHAR(100) UNIQUE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- FINANCE
-- =========================================================

CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    currency_id UUID REFERENCES currencies(id),
    method VARCHAR(50),
    utr_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    payment_gateway VARCHAR(50),
    proof_image TEXT,
    approved_by UUID,
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    bank_details JSONB,
    processed_by UUID,
    processed_at TIMESTAMP,
    txn_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- CASINO GAMES
-- =========================================================

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rtp_percentage DECIMAL(5,2),
    min_bet DECIMAL(20,8) DEFAULT 0,
    max_bet DECIMAL(20,8) DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provably_fair_seeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id),
    client_seed TEXT NOT NULL,
    server_seed TEXT NOT NULL,
    server_seed_hash TEXT NOT NULL,
    nonce BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id),
    round_number VARCHAR(100) UNIQUE NOT NULL,
    bet_amount DECIMAL(24,8) NOT NULL,
    payout_multiplier DECIMAL(20,4),
    payout_amount DECIMAL(24,8),
    result_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    seed_id UUID REFERENCES provably_fair_seeds(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- =========================================================
-- SPORTSBOOK
-- =========================================================

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_sport_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code VARCHAR(5) UNIQUE NOT NULL,
    flag_url TEXT
);

CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_league_id VARCHAR(50) UNIQUE NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(id),
    name VARCHAR(255) NOT NULL,
    season VARCHAR(20),
    logo TEXT,
    priority INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_team_id VARCHAR(50) UNIQUE NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    logo TEXT
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_match_id VARCHAR(50) UNIQUE NOT NULL,
    sport_id UUID REFERENCES sports(id),
    league_id UUID REFERENCES leagues(id),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    match_datetime TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'scheduled',
    score_home INT DEFAULT 0,
    score_away INT DEFAULT 0,
    live_clock VARCHAR(20),
    match_stats JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE odds_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_market_id VARCHAR(100),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE odds_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES odds_markets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_selection_id VARCHAR(100),
    price DECIMAL(20,4) NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sports_betslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_stake DECIMAL(24,8) NOT NULL,
    total_odds DECIMAL(20,4) NOT NULL,
    possible_win DECIMAL(24,8) NOT NULL,
    bet_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    placed_at TIMESTAMP DEFAULT NOW(),
    settled_at TIMESTAMP,
    cashout_amount DECIMAL(24,8)
);

CREATE TABLE sports_bet_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    betslip_id UUID NOT NULL REFERENCES sports_betslips(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id),
    market_id UUID REFERENCES odds_markets(id),
    selection_id UUID REFERENCES odds_selections(id),
    odds_at_bet DECIMAL(20,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    result_json JSONB
);

-- =========================================================
-- AGENTS / AFFILIATE
-- =========================================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    agent_level INT DEFAULT 1,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    parent_agent_id UUID REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    commission_earned DECIMAL(24,8) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ADMIN
-- =========================================================

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(255),
    target_table VARCHAR(50),
    target_id UUID,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- SETTINGS / REPORTS
-- =========================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(50),
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE UNIQUE NOT NULL,
    total_deposits DECIMAL(24,8) DEFAULT 0,
    total_withdrawals DECIMAL(24,8) DEFAULT 0,
    casino_turnover DECIMAL(24,8) DEFAULT 0,
    casino_ggr DECIMAL(24,8) DEFAULT 0,
    sportsbook_turnover DECIMAL(24,8) DEFAULT 0,
    sportsbook_ggr DECIMAL(24,8) DEFAULT 0,
    active_users INT DEFAULT 0,
    new_registrations INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100),
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX idx_game_rounds_user ON game_rounds(user_id);
CREATE INDEX idx_matches_datetime ON matches(match_datetime);
CREATE INDEX idx_sports_bets_user ON sports_betslips(user_id);
CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);

-- =========================================================
-- DONE
-- =========================================================
```

## Schema Overview

This database schema supports a comprehensive casino and sportsbook platform with the following key modules:

### Core Modules:
- **Users & Authentication**: User management, KYC, VIP levels
- **Wallet System**: Multi-currency wallets with transaction tracking
- **Finance**: Deposits, withdrawals, payment processing
- **Casino Games**: Game catalog, provably fair system, game rounds
- **Sportsbook**: Sports, leagues, matches, odds, betting
- **Agent/Affiliate**: Multi-level agent system and referral tracking
- **Admin**: Admin users and activity logging
- **Reports & Settings**: Daily reports and platform configuration

### Key Features:
- UUID primary keys for security
- Proper foreign key relationships with cascade deletes
- Comprehensive indexing for performance
- JSONB fields for flexible data storage
- Audit trails with activity logs
- Multi-currency support
- Provably fair gaming system
- Real-time sports betting infrastructure

The schema is production-ready and can be executed directly in pgAdmin.
