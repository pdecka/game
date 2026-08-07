# Architecture Documentation

## System Overview

The gaming platform is built as a monorepo with three main components:

1. **Frontend** - Next.js 14 application
2. **Backend** - NestJS API server
3. **Shared** - Shared TypeScript types

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (can be added)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (TypeORM)
- **Cache**: Redis
- **Authentication**: JWT + Passport
- **Validation**: class-validator

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+

## Architecture Patterns

### Backend Architecture

```
┌─────────────────────────────────────┐
│         API Gateway Layer           │
│    (Rate Limiting, CORS, Auth)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Controller Layer            │
│   (Request/Response Handling)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Service Layer              │
│      (Business Logic)               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Repository Layer              │
│      (Data Access)                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database Layer               │
│      (PostgreSQL)                   │
└─────────────────────────────────────┘
```

### Module Structure

Each feature module follows this structure:

```
module-name/
├── module-name.module.ts    # Module definition
├── module-name.service.ts   # Business logic
├── module-name.controller.ts # HTTP endpoints
├── entities/                # Database entities
├── dto/                     # Data transfer objects
└── guards/                  # Route guards (if needed)
```

## Key Design Decisions

### 1. Ledger-Based Wallet System

All wallet transactions are recorded in a ledger table. This ensures:
- Complete audit trail
- Easy reconciliation
- Transaction history
- No direct balance modifications

### 2. Provably Fair Games

Games use server seed + client seed + nonce to generate results:
- Server seed is hashed and shown to user before game
- After game, server seed is revealed
- User can verify fairness using the hash

### 3. Multi-Currency Support

Wallet supports multiple currencies (INR, USDT, BTC):
- Separate balance columns for each currency
- Currency-specific transactions
- Exchange rate handling (future)

### 4. Role-Based Access Control

User roles:
- `user` - Regular user
- `admin` - Full admin access
- `support` - Support staff
- `finance` - Finance operations
- `risk_manager` - Risk management

### 5. Transaction Types

All transactions are categorized:
- `deposit` - Money coming in
- `withdrawal` - Money going out
- `bet` - Placing a bet
- `win` - Winning a bet
- `loss` - Losing a bet
- `bonus` - Bonus credit
- `refund` - Refund transaction

## Database Schema

### Core Tables

- `users` - User accounts
- `wallets` - Wallet balances
- `ledger_entries` - All transactions
- `game_sessions` - Game play history
- `payments` - Payment records
- `bonuses` - Bonus records
- `promotions` - Promotion definitions
- `kyc_documents` - KYC submissions
- `admin_logs` - Admin action logs

## Security Considerations

1. **Password Hashing**: bcrypt with 10 rounds
2. **JWT Tokens**: Short-lived access tokens + refresh tokens
3. **2FA**: TOTP-based two-factor authentication
4. **Rate Limiting**: Throttler module
5. **Input Validation**: class-validator on all DTOs
6. **SQL Injection**: TypeORM parameterized queries
7. **XSS**: Input sanitization (frontend)

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API design
2. **Database**: Read replicas for queries
3. **Caching**: Redis for session and frequently accessed data
4. **Queue System**: For async operations (future)
5. **Microservices**: Can be split into services (future)

## Deployment Architecture

### Development
- Single server running all services
- Local PostgreSQL and Redis

### Production (Recommended)
- Load balancer (Nginx/Cloudflare)
- Multiple API servers (horizontal scaling)
- PostgreSQL with read replicas
- Redis cluster
- CDN for static assets
- Monitoring and logging (Prometheus, Grafana)

## Future Enhancements

1. **WebSocket Support**: Real-time game updates
2. **Sports Betting**: Full sportsbook implementation
3. **Game Providers**: Integration with external providers
4. **Mobile Apps**: React Native apps
5. **Analytics**: Advanced analytics dashboard
6. **Multi-language**: i18n support
7. **Advanced Fraud Detection**: ML-based detection
