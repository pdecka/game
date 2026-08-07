# Production Deployment Guide - Local Database

**Date**: April 10, 2026  
**Status**: Testing Phase - Local PostgreSQL  
**Version**: Phase 2

## Current Production URLs

- **Frontend**: https://game-peach-eight.vercel.app/
- **Backend**: https://game-20eg.onrender.com

## System Architecture Overview

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

## Database Architecture: Local PostgreSQL

### Current Setup
- **Database**: PostgreSQL running on your laptop
- **Cost**: Free
- **Availability**: When laptop is on and connected
- **Control**: Full control over database

### Important Notes
- **Laptop Must Stay On**: Database shuts down when laptop is off
- **Port Forwarding Required**: Backend needs to reach your local database
- **Internet Connection**: Required for platform to function
- **Single Point of Failure**: No automatic failover

### When to Consider Cloud Database
Upgrade to cloud database when:
- Platform needs 24/7 availability
- User base grows significantly
- You need automatic backups and monitoring
- Ready for production scaling

## Local Database Setup Steps

### Step 1: Create Local Database

1. **Open PostgreSQL Command Line**
   ```bash
   psql -U postgres
   ```

2. **Create Gaming Platform Database**
   ```sql
   CREATE DATABASE gaming_platform;
   CREATE USER gaming_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gaming_platform TO gaming_user;
   ```

3. **Enable Required Extensions**
   ```sql
   \c gaming_platform
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

### Step 2: Configure Remote Access

1. **Enable Remote Connections**
   - Edit `postgresql.conf`: `listen_addresses = '*'`
   - Edit `pg_hba.conf`: Add `host all all 0.0.0.0/0 md5`
   - Restart PostgreSQL service

2. **Configure Port Forwarding**
   - Forward port 5432 to your laptop's IP
   - Test port accessibility

### Step 3: Update Backend Configuration

1. **Set Environment Variables on Render**
   ```env
   DATABASE_URL=postgresql://gaming_user:password@your_public_ip:5432/gaming_platform
   DB_SSL=false
   DB_SYNCHRONIZE=true
   NODE_ENV=production
   ```

2. **Update Database Configuration**
   ```typescript
   TypeOrmModule.forRoot({
     type: 'postgres',
     url: process.env.DATABASE_URL,
     ssl: false,
     synchronize: true,
     logging: false,
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
   })
   ```

### Step 4: Test and Deploy

1. **Test Database Connection**
2. **Deploy Backend to Render**
3. **Test API Endpoints**
4. **Verify Frontend Integration**

## Laptop Shutdown Impact

### What Happens When Laptop is Off

**Database Status:**
- PostgreSQL service stops
- Database becomes unavailable
- All API calls fail
- Platform becomes inaccessible

**User Experience:**
- Frontend shows connection errors
- Cannot login/register
- Games don't work
- Wallet operations fail

**Requirements for Operation:**
- Laptop must stay on
- Stable internet connection
- PostgreSQL service running
- Port forwarding configured

**Risks:**
- Power outages affect platform
- Network interruptions cause downtime
- System crashes impact users
- Security vulnerabilities with open ports

## Implementation Details

### Database Setup Commands

```bash
# Create database and user
psql -U postgres -c "CREATE DATABASE gaming_platform;"
psql -U postgres -c "CREATE USER gaming_user WITH PASSWORD 'secure_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE gaming_platform TO gaming_user;"

# Connect and enable extensions
psql -U gaming_user -d gaming_platform -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -U gaming_user -d gaming_platform -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
```

### Backend Environment Setup

```env
# Render Environment Variables
DATABASE_URL=postgresql://gaming_user:secure_password@YOUR_PUBLIC_IP:5432/gaming_platform
DB_SSL=false
DB_SYNCHRONIZE=true
NODE_ENV=production
JWT_SECRET=your-jwt-secret
REDIS_URL=your-redis-url
```

### Testing Commands

```bash
# Test database connection
psql "postgresql://gaming_user:secure_password@localhost:5432/gaming_platform" -c "SELECT version();"

# Test backend health
curl https://game-20eg.onrender.com/health

# Test frontend
# Open https://game-peach-eight.vercel.app/ in browser
```

## System Flow Diagram

```
User's Browser
    |
    | HTTPS Request
    v
Vercel (Frontend)
    |
    | API Call (HTTPS)
    v
Render (Backend)
    |
    | Database Query (No SSL)
    v
Local PostgreSQL (Your Laptop)
    |
    | Response
    v
Backend Processes Response
    |
    | API Response (HTTPS)
    v
Frontend Updates UI
```

## Monitoring and Maintenance

### Database Monitoring

1. **Local Database Status**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check database size
   psql -U gaming_user -d gaming_platform -c "SELECT pg_size_pretty(pg_database_size('gaming_platform'));"
   ```

2. **Render Dashboard**
   - Monitor backend health
   - Check error logs
   - Track API response times

3. **Vercel Dashboard**
   - Monitor frontend performance
   - Check build logs
   - Track user analytics

### Backup Strategy

1. **Manual Backups**
   ```bash
   # Create backup
   pg_dump -U gaming_user gaming_platform > backup_$(date +%Y%m%d).sql
   
   # Restore backup
   psql -U gaming_user gaming_platform < backup_20230410.sql
   ```

2. **Automated Backups** (Optional)
   - Create backup script
   - Schedule with Windows Task Scheduler

## Security Considerations

### Database Security

1. **Connection Security**
   - Always use SSL connections
   - Store credentials securely
   - Use environment variables

2. **Access Control**
   - Limit database user permissions
   - Use read-only users where possible
   - Enable row-level security

### API Security

1. **Environment Variables**
   - Never commit secrets to git
   - Use Render's environment variable management
   - Rotate secrets regularly

2. **Rate Limiting**
   - Implement API rate limiting
   - Use Redis for rate limiting
   - Monitor for abuse

## Cost Analysis

### Current Setup (Local Database)

| Component | Cost | Notes |
|----------|------|-------|
| PostgreSQL | FREE | Already installed on laptop |
| Backend (Render) | FREE tier | Limited resources |
| Frontend (Vercel) | FREE tier | Static hosting |
| **Total** | **$0/month** | Perfect for testing |

### When to Upgrade

Consider paid options when:
- Need 24/7 database availability
- User base grows beyond 100 users
- Performance issues arise
- Ready for production launch

## Troubleshooting Guide

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify SSL settings
   - Confirm database is running

2. **Migration Errors**
   - Check migration files
   - Verify database permissions
   - Run migrations manually

3. **API Timeouts**
   - Check database performance
   - Optimize slow queries
   - Increase timeout settings

### Emergency Procedures

1. **Database Outage**
   - Check provider status page
   - Enable read replica if available
   - Notify users of downtime

2. **Backend Failure**
   - Check Render logs
   - Redeploy backend
   - Verify environment variables

## Next Steps Checklist

### Immediate (Today)
- [ ] Create local PostgreSQL database
- [ ] Set up port forwarding
- [ ] Get your public IP address
- [ ] Test database connectivity

### Short Term (This Week)
- [ ] Update Render environment variables
- [ ] Deploy and test backend
- [ ] Test complete user flows
- [ ] Set up backup procedures

### Long Term (Next Month)
- [ ] Monitor platform stability
- [ ] Plan cloud migration when ready
- [ ] Optimize database performance
- [ ] Prepare for production scaling

---

## Summary

**Current Setup**: Local PostgreSQL database with live backend on Render.

**Testing Phase**: Perfect for development and testing without additional costs.

**Next Steps**: 
1. Set up local database with remote access
2. Configure backend to connect to local database
3. Test complete platform functionality
4. Monitor and optimize

**Future Upgrade**: Move to cloud database when ready for 24/7 production availability.
