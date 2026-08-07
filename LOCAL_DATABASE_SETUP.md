# Local PostgreSQL Setup Guide

**Date**: April 10, 2026  
**Status**: Testing Phase  
**Version**: Phase 2 - Local Database

## Current Production URLs

- **Frontend**: https://game-peach-eight.vercel.app/
- **Backend**: https://game-20eg.onrender.com

## System Architecture (Local Setup)

```
Frontend (Vercel) 
    HTTPS
    |
    v
Backend (Render) 
    HTTPS
    |
    v
Database (Local PostgreSQL on Your Laptop)
    Local Network
```

## Prerequisites

### Local PostgreSQL Installation
- PostgreSQL 14+ installed on your laptop
- pgAdmin 4 (optional, for database management)
- Command line access to PostgreSQL

### Network Requirements
- Stable internet connection
- Laptop must remain on for platform to work
- Port forwarding configured (if needed)

## Step-by-Step Local Database Setup

### Step 1: Create Database

1. **Open PostgreSQL Command Line**
   ```bash
   # Windows - Open Command Prompt or PowerShell
   psql -U postgres
   
   # Or use pgAdmin to create database visually
   ```

2. **Create Gaming Platform Database**
   ```sql
   CREATE DATABASE gaming_platform;
   CREATE USER gaming_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gaming_platform TO gaming_user;
   \q
   ```

3. **Verify Database Creation**
   ```bash
   psql -U gaming_user -d gaming_platform -c "\l"
   ```

### Step 2: Configure Database Extensions

```sql
-- Connect to your new database
psql -U gaming_user -d gaming_platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extensions
\dx
```

### Step 3: Enable Remote Connections

1. **Edit PostgreSQL Configuration**
   ```
   # Find postgresql.conf (usually in PostgreSQL/data/)
   # Windows: C:\Program Files\PostgreSQL\14\data\postgresql.conf
   
   # Uncomment and modify:
   listen_addresses = '*'
   port = 5432
   ```

2. **Edit pg_hba.conf**
   ```
   # Find pg_hba.conf (same directory)
   # Add this line at the end:
   host    all             all             0.0.0.0/0               md5
   ```

3. **Restart PostgreSQL Service**
   ```bash
   # Windows
   # Services > PostgreSQL > Restart
   ```

### Step 4: Configure Port Forwarding (Router)

1. **Find Your Public IP**
   ```bash
   # Visit: https://whatismyipaddress.com/
   ```

2. **Router Port Forwarding**
   - Forward port 5432 to your laptop's local IP
   - Use TCP protocol
   - Save and restart router

3. **Test Port Forwarding**
   ```bash
   # Use online port checker tool
   # Visit: https://www.yougetsignal.com/tools/open-ports/
   # Check port 5432
   ```

### Step 5: Update Backend Environment

1. **Get Your Public IP**
   ```bash
   # Your public IP from step 4
   PUBLIC_IP="your_public_ip"
   ```

2. **Update Render Environment Variables**
   ```env
   DATABASE_URL=postgresql://gaming_user:your_secure_password@your_public_ip:5432/gaming_platform
   DB_SSL=false
   DB_SYNCHRONIZE=true
   NODE_ENV=production
   JWT_SECRET=your-jwt-secret
   REDIS_URL=your-redis-url
   ```

3. **Update Backend Database Configuration**
   ```typescript
   // backend/src/config/database.config.ts
   export const databaseConfig = {
     type: 'postgres' as const,
     url: process.env.DATABASE_URL,
     ssl: false, // Local database
     synchronize: true, // Auto-create tables for testing
     logging: process.env.NODE_ENV === 'development',
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
   };
   ```

### Step 6: Test Database Connection

1. **Test from Local Machine**
   ```bash
   # Test local connection
   psql -U gaming_user -d gaming_platform -h localhost -p 5432
   
   # Should connect successfully
   ```

2. **Test from Backend**
   ```bash
   # Temporarily set environment locally
   DATABASE_URL="postgresql://gaming_user:your_secure_password@localhost:5432/gaming_platform"
   
   # Start backend locally
   cd backend
   npm run start:dev
   ```

3. **Test Remote Connection**
   ```bash
   # Test that Render can reach your database
   # Check Render logs for database connection status
   ```

### Step 7: Deploy and Test Live Backend

1. **Redeploy Backend on Render**
   - Go to Render dashboard
   - Update environment variables
   - Trigger new deployment
   - Wait for deployment to complete

2. **Test Live Backend**
   ```bash
   # Test health endpoint
   curl https://game-20eg.onrender.com/health
   
   # Test database connection
   curl https://game-20eg.onrender.com/api/test-db
   ```

3. **Test Frontend Integration**
   - Open https://game-peach-eight.vercel.app/
   - Try to register/login
   - Check if wallet operations work
   - Test game functionality

## Database Schema Setup

### Automatic Schema Creation (Testing)

Since `DB_SYNCHRONIZE=true`, tables will be created automatically:

```typescript
// Core entities that will be created:
- Users
- Wallets  
- Transactions
- Games
- Bets
- KYC Verifications
- Admin Users
```

### Manual Schema Setup (Optional)

```sql
-- If you prefer manual setup:
-- Run these commands in your database:

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add other tables as needed...
```

## Testing Procedures

### Step 1: Basic Connectivity Test

```bash
# Test 1: Local database access
psql -U gaming_user -d gaming_platform -c "SELECT version();"

# Test 2: Remote access simulation
psql -U gaming_user -d gaming_platform -h your_public_ip -p 5432 -c "SELECT version();"
```

### Step 2: Backend Integration Test

```bash
# Test backend health
curl -X GET https://game-20eg.onrender.com/health

# Expected response:
# {"status": "ok", "database": "connected"}
```

### Step 3: Full Application Test

1. **User Registration Test**
   - Go to frontend
   - Create new account
   - Check if user appears in database

2. **Wallet Test**
   - Add funds to wallet
   - Check transaction in database

3. **Game Test**
   - Play a game
   - Verify bet records in database

## Security Considerations

### Database Security

1. **Strong Password**
   ```sql
   -- Use a strong password for gaming_user
   ALTER USER gaming_user WITH PASSWORD 'complex_password_123!';
   ```

2. **Firewall Rules**
   - Only allow Render's IP ranges
   - Block unknown IP addresses

3. **Regular Backups**
   ```bash
   # Create backup script
   pg_dump -U gaming_user gaming_platform > backup_$(date +%Y%m%d).sql
   ```

### Network Security

1. **Port Forwarding Security**
   - Use specific IP restrictions if possible
   - Monitor connection logs

2. **Change Default Port** (Optional)
   ```
   # Change from 5432 to a custom port
   # Update both postgresql.conf and router forwarding
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   pg_ctl status
   
   # Check if port is open
   netstat -an | findstr 5432
   ```

2. **Authentication Failed**
   ```bash
   # Check pg_hba.conf configuration
   # Verify user exists and has correct password
   ```

3. **Backend Cannot Connect**
   - Check Render logs for error messages
   - Verify DATABASE_URL format
   - Test port forwarding with online tool

### Debug Commands

```bash
# Check PostgreSQL logs
# Windows: C:\Program Files\PostgreSQL\14\data\pg_log\

# Test connection string
psql "postgresql://gaming_user:password@host:5432/gaming_platform"

# Check active connections
psql -U gaming_user -d gaming_platform -c "SELECT * FROM pg_stat_activity;"
```

## Maintenance

### Daily Tasks

1. **Check Database Status**
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. **Monitor Disk Space**
   ```bash
   # Check database size
   psql -U gaming_user -d gaming_platform -c "SELECT pg_size_pretty(pg_database_size('gaming_platform'));"
   ```

### Weekly Tasks

1. **Create Backup**
   ```bash
   pg_dump -U gaming_user gaming_platform > weekly_backup.sql
   ```

2. **Update Statistics**
   ```sql
   ANALYZE;
   ```

## Limitations and Considerations

### Current Limitations

1. **Laptop Must Stay On**
   - Database shuts down when laptop is off
   - Platform becomes unavailable

2. **Network Dependency**
   - Requires stable internet connection
   - Port forwarding must work correctly

3. **Single Point of Failure**
   - No automatic failover
   - Limited scalability

### When to Upgrade to Cloud

Consider upgrading when:
- You need 24/7 availability
- User base grows beyond 100 users
- You experience performance issues
- You need automatic backups

## Next Steps

### Immediate (Today)
- [ ] Set up local PostgreSQL database
- [ ] Configure port forwarding
- [ ] Update backend environment variables
- [ ] Test basic connectivity

### Short Term (This Week)
- [ ] Deploy and test live backend
- [ ] Verify all API endpoints work
- [ ] Test complete user flows
- [ ] Set up backup procedures

### Long Term (Next Month)
- [ ] Monitor performance and stability
- [ ] Plan cloud migration when ready
- [ ] Optimize database queries

---

## Summary

This setup allows you to test your gaming platform with a local PostgreSQL database connected to your live backend on Render. The platform will work as long as your laptop is on and connected to the internet. This is perfect for testing and development before moving to a paid cloud solution.
