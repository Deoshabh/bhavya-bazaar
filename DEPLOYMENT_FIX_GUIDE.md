# 🚀 Bhavya Bazaar Deployment Fix Guide

This guide addresses the Redis authentication issues and other problems encountered during Coolify deployment.

## 🔧 Issues Fixed

### 1. Redis Authentication Problems
- **Issue**: "WRONGPASS invalid username-password pair" errors
- **Cause**: Password mismatch between environment variables and Redis service
- **Fix**: Improved Redis configuration and authentication handling

### 2. Cache Warmup Failures
- **Issue**: "cacheWarmup.warmAllCaches is not a function" error
- **Cause**: Missing method in CacheWarmupService
- **Fix**: Added `warmAllCaches()` method to CacheWarmupService

### 3. Connection Cycling
- **Issue**: Redis connections connecting/disconnecting repeatedly
- **Cause**: Authentication failures and offline queue issues
- **Fix**: Better error handling and connection management

## 🛠️ Quick Fixes Applied

### Fixed Files:
1. **`backend/utils/cacheWarmup.js`** - Added missing `warmAllCaches()` method
2. **`backend/config/redis.js`** - Improved password handling
3. **`backend/server.js`** - Better Redis connection handling and logging
4. **`docker-compose.coolify.yml`** - Conditional Redis authentication
5. **`backend/.env.production`** - Production environment template

### New Tools Created:
1. **`backend/scripts/redis-troubleshoot.js`** - Redis connection diagnostics
2. **`backend/scripts/seed-database.js`** - Sample data seeder

## 🔍 Troubleshooting Steps

### Step 1: Run Redis Diagnostics
```bash
cd backend
node scripts/redis-troubleshoot.js
```

### Step 2: Check Current Environment
Verify these environment variables in Coolify:
```bash
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_DB=0
```

### Step 3: Redis Password Configuration
Two scenarios:

#### Scenario A: Redis WITH Password
```bash
# In Coolify environment variables
REDIS_PASSWORD=your_secure_password_here

# Docker compose will use: --requirepass your_secure_password_here
```

#### Scenario B: Redis WITHOUT Password
```bash
# In Coolify environment variables
# REDIS_PASSWORD= (leave empty or don't set)

# Docker compose will run: redis-server (no auth required)
```

## 🚨 Critical Fixes for Deployment

### 1. Fix Redis Authentication (Choose One)

#### Option A: Use Redis Without Password
In Coolify backend environment variables:
```bash
# Remove or comment out REDIS_PASSWORD
# REDIS_PASSWORD=

# Keep these:
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
```

#### Option B: Use Redis With Password
In Coolify backend environment variables:
```bash
REDIS_PASSWORD=MySecureRedisPassword123

# Keep these:
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
```

### 2. Update Docker Compose
The updated `docker-compose.coolify.yml` now handles both scenarios automatically.

### 3. Redeploy Services
In Coolify:
1. Stop the Redis service
2. Stop the Backend service
3. Update environment variables
4. Start Redis service first
5. Wait for Redis to be healthy
6. Start Backend service

## 📊 Sample Data Setup

### Add Sample Data
```bash
cd backend
node scripts/seed-database.js
```

This creates:
- **Users**: john@example.com, jane@example.com (password: password123)
- **Shops**: tech@paradise.com, fashion@hub.com, books@world.com (password: password123)
- **Products**: 9 sample products across different categories

## 🧪 Testing the Fixes

### 1. Test Redis Connection
```bash
curl https://api.bhavyabazaar.com/api/v2/cache/health
```

### 2. Test Cache Warming
```bash
curl -X POST https://api.bhavyabazaar.com/api/v2/cache/warm
```

### 3. Test API Health
```bash
curl https://api.bhavyabazaar.com/api/v2/health
```

### 4. Test Cache Performance
```bash
curl -X POST https://api.bhavyabazaar.com/api/v2/cache/benchmark
```

## 🔧 Frontend 404 Fix

For the frontend routing issues (404 on refresh):

### Add to frontend nginx.conf or server configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Or in Coolify, add environment variable:
```bash
NGINX_TRY_FILES=true
```

## 📋 Environment Variables Checklist

Copy these to your Coolify backend service:

```bash
# Core
NODE_ENV=production
PORT=8000

# Database
DB_URL=mongodb://mongo:27017/bhavyabazaar
MONGO_PASSWORD=your_mongo_password

# Redis (choose one approach)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_redis_password_or_leave_empty

# Authentication
JWT_SECRET_KEY=your_jwt_secret_32_chars_minimum
ACTIVATION_SECRET=your_activation_secret_here

# CORS
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```

## 🚀 Deployment Commands for Coolify

### 1. Update Environment Variables
```bash
# In Coolify Panel > Your Backend Service > Environment Variables
# Add/update the variables listed above
```

### 2. Restart Services
```bash
# In Coolify Panel:
# 1. Stop Backend service
# 2. Stop Redis service (if exists)
# 3. Start Redis service
# 4. Wait for Redis health check
# 5. Start Backend service
```

### 3. Check Logs
```bash
# In Coolify Panel > Logs
# Monitor both Redis and Backend logs for connection success
```

## ✅ Success Indicators

You'll know the fixes worked when you see:
- ✅ Redis client connected successfully
- ✅ Redis client ready to handle commands  
- ✅ Cache warmup completed successfully
- No more "WRONGPASS" errors
- No more connection cycling
- Cache endpoints respond correctly

## 🆘 If Issues Persist

1. **Check Docker logs** in Coolify panel
2. **Run diagnostics script**: `node scripts/redis-troubleshoot.js`
3. **Try without Redis password** first (simpler setup)
4. **Verify network connectivity** between containers
5. **Check Redis service health** in Coolify

The most common solution is to **remove the Redis password** for initial testing, then add it back once everything works.
