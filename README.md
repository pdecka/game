# Gaming Platform - Complete Casino & Sports Betting Platform

A comprehensive, production-ready online casino and sports betting platform with multi-currency support (INR, USDT, BTC), provably fair games, and full compliance features.

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │  Next.js 14 (App Router)
│   (Web/Mobile)  │  Tailwind CSS + Framer Motion
└────────┬────────┘
         │
┌────────▼────────┐
│   API Gateway   │  Rate Limiting + Auth
└────────┬────────┘
         │
┌────────▼────────┐
│  Auth Service   │  JWT + 2FA + OTP
└────────┬────────┘
         │
┌────────▼────────┐
│ Wallet Service  │  Multi-Currency Ledger
└────────┬────────┘
         │
┌────────▼────────┐
│  Game Engine    │  Provably Fair RNG
└────────┬────────┘
         │
┌────────▼────────┐
│ Payment Gateway │  INR + Crypto
└─────────────────┘
```

## 📁 Project Structure

```
gaming-platform/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── shared/            # Shared TypeScript types
├── docker/            # Docker configurations
└── docs/              # Documentation

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start development servers
npm run dev
```

### Environment Setup

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gaming_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Payment Gateways
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

# Crypto
CRYPTO_API_KEY=your-key
CRYPTO_WALLET_ADDRESS=your-address

# OTP
OTP_SECRET=your-otp-secret
SMS_API_KEY=your-sms-key

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 🎮 Features

### Core Features
- ✅ Multi-currency wallet (INR, USDT, BTC)
- ✅ Ledger-based accounting system
- ✅ Provably fair games
- ✅ Real-time game engine (WebSocket)
- ✅ Sports betting engine
- ✅ Bonus & promotion system
- ✅ VIP tiers
- ✅ KYC/AML compliance
- ✅ Fraud detection
- ✅ Responsible gaming tools

### Games
- Dice
- Crash
- Mines
- Plinko
- Roulette
- Slots (coming soon)

### Payment Methods
- INR: Razorpay, Cashfree, PayU
- Crypto: USDT, BTC (with custodial wallet support)

## 🔐 Security Features

- JWT authentication with refresh tokens
- 2FA mandatory for withdrawals
- OTP verification (SMS/Email)
- Rate limiting
- IP tracking & device fingerprinting
- Password hashing (bcrypt)
- Transaction logging & audit trail

## 👥 Admin Panel

- User management
- Wallet operations
- Withdrawal approval
- KYC verification
- Game RTP control
- Bonus management
- Fraud alerts
- Analytics dashboard

## 📊 Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- WebSocket (real-time)
- PWA support

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Redis
- WebSocket
- Microservice-ready

### Infrastructure
- Docker
- Kubernetes (production)
- AWS/GCP/DigitalOcean
- Cloudflare (DDoS protection)

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 📝 Legal & Compliance

⚠️ **IMPORTANT**: This platform requires:
- Gaming license (Curaçao/Malta/Isle of Man)
- Company registration
- KYC/AML compliance
- Geo-blocking for restricted regions
- Responsible gaming features

**This is a development template. Ensure proper legal compliance before production use.**

## 🚧 Development Roadmap

- [x] Project structure
- [x] Authentication system
- [x] Wallet & ledger
- [x] Game engine foundation
- [x] Payment integration
- [x] Admin panel
- [ ] Sports betting (full)
- [ ] Mobile apps
- [ ] Advanced analytics
- [ ] Multi-language support

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For development questions, please refer to the documentation in `/docs`.

---

**Built with ❤️ for the gaming industry**
