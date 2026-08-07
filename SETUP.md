# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis 6+ installed and running
- Docker (optional, for containerized setup)

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Database Setup

#### PostgreSQL

```bash
# Create database
createdb gaming_db

# Or using psql
psql -U postgres -c "CREATE DATABASE gaming_db;"
```

#### Redis

```bash
# Start Redis (if not running)
redis-server
```

### 3. Environment Variables

#### Backend

Create `backend/.env` file:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://gaming_user:gaming_password@localhost:5432/gaming_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP
OTP_SECRET=your-otp-secret-key
OTP_EXPIRES_IN=300

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Crypto
CRYPTO_API_KEY=your-crypto-api-key
CRYPTO_WALLET_ADDRESS=your-wallet-address

# Admin
ADMIN_EMAIL=admin@gaming.com
ADMIN_PASSWORD=ChangeThisPassword123!

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 4. Build Shared Package

```bash
cd shared
npm run build
cd ..
```

### 5. Start Development Servers

#### Option A: Using npm scripts (recommended)

```bash
# Start both frontend and backend
npm run dev
```

#### Option B: Start separately

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Using Docker (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## First Time Setup

### Create Admin User

The admin user should be created manually or through a migration script. For now, you can use the registration endpoint and then update the user role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@gaming.com';
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env` file
- Verify database exists: `psql -l`

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL in `.env` file

### Port Already in Use

- Change PORT in backend `.env` file
- Update NEXT_PUBLIC_API_URL in frontend `.env.local`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Build backend: `cd backend && npm run build`
4. Use process manager (PM2) or Docker for production
5. Set up proper SSL certificates
6. Configure firewall rules
7. Set up database backups
8. Configure monitoring and logging

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Keep dependencies updated
