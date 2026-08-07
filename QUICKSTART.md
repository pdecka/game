# Quick Start Guide

Get your gaming platform up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check if PostgreSQL is running
pg_isready

# Check if Redis is running
redis-cli ping
```

## Step 1: Clone and Install

```bash
# Install all dependencies
npm run install:all

# Build shared package
cd shared && npm run build && cd ..
```

## Step 2: Setup Database

```bash
# Create database
createdb gaming_db

# Or using psql
psql -U postgres -c "CREATE DATABASE gaming_db;"
```

## Step 3: Configure Environment

### Backend
Copy `backend/.env.example` to `backend/.env` and update values:

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Minimum required changes:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A random secret string
- `REDIS_URL` - Your Redis connection string

### Frontend
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Step 4: Start Services

### Option A: Development Mode (Recommended)

```bash
# From root directory
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

### Option B: Docker

```bash
docker-compose up -d
```

## Step 5: Create Admin User

1. Register a user via the frontend: http://localhost:3000/auth/register
2. Update user role in database:

```sql
psql gaming_db
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Step 6: Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs**: See `docs/API.md`

## Common Issues

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=3002
```

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists

### Module Not Found
```bash
# Rebuild shared package
cd shared && npm run build && cd ..
```

## Next Steps

1. Configure payment gateways (Razorpay, Crypto)
2. Set up KYC verification service
3. Configure email/SMS for OTP
4. Review security settings
5. Set up monitoring

## Need Help?

- Check `SETUP.md` for detailed setup
- Review `docs/ARCHITECTURE.md` for system design
- See `docs/API.md` for API documentation
