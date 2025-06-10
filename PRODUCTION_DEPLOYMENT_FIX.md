# Production Deployment Fix Guide

## Issue Summary
After codebase cleanup, the production deployment is failing with:
```
Error: Cannot find module '../config/redis'
```

This error occurs because the production environment has cached the old version of the code that referenced the Redis config files we removed during cleanup.

## 🔧 Solution Steps

### 1. **Clear Production Cache**
Your production deployment needs to be rebuilt to pick up the cleaned codebase:

#### For Docker Deployments:
```bash
# Force rebuild the Docker image
docker build --no-cache -t bhavya-bazaar-backend ./backend
docker build --no-cache -t bhavya-bazaar-frontend ./frontend

# Or if using docker-compose
docker-compose build --no-cache
docker-compose down && docker-compose up -d
```

#### For Coolify/Platform Deployments:
1. **Trigger a new deployment** from your Git repository
2. **Clear build cache** if your platform supports it
3. **Force rebuild** the application containers

#### For Manual Deployments:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart the application
pm2 restart all  # or your process manager
```

### 2. **Verify Environment Variables**
Ensure your production environment has the correct Redis configuration:

```bash
# Required environment variables
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Database
DB_URI=your-mongodb-connection-string

# Session secret
SESSION_SECRET=your-session-secret
ADMIN_SECRET_KEY=bhavya_bazaar_admin_2025_secure_key
```

### 3. **Update Your Deployment Pipeline**

#### .dockerignore (if using Docker)
Ensure these entries are in your `.dockerignore`:
```
node_modules
npm-debug.log*
.git
.gitignore
*.md
.env.local
.env.development
build
```

#### Dockerfile Optimization
Update your backend Dockerfile to ensure clean builds:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Remove development files
RUN rm -rf tests/ docs/ *.md

EXPOSE 8000
CMD ["npm", "start"]
```

### 4. **Verify Cleaned Files**
Confirm these files were properly removed in production:
- ❌ `backend/config/redis.js`
- ❌ `backend/config/redis.production.js`  
- ❌ `backend/utils/sessionService.old.js`
- ❌ `backend/utils/sessionService.new.js`
- ❌ `backend/utils/jwtToken.js`
- ❌ `backend/utils/shopToken.js`

## 🧪 Testing After Deployment

### 1. **Check Server Health**
```bash
curl https://your-domain.com/api/health
```

### 2. **Test Authentication Endpoints**
```bash
# Test session status
curl https://your-domain.com/api/auth/session-status

# Test user login
curl -X POST https://your-domain.com/api/auth/login-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. **Monitor Logs**
Check for these success indicators:
```
✅ Trust proxy configured
✅ API rate limiter enabled  
🚀 Server listening on port 8000
✅ Database optimizer initialized
```

## 🚨 Rollback Plan (If Needed)

If you need to quickly rollback:

### Option 1: Restore Redis Config Files
Create minimal Redis config to get production running:

```javascript
// backend/config/redis.js
module.exports = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0
};
```

### Option 2: Git Rollback
```bash
# Find the commit before cleanup
git log --oneline -10

# Rollback to previous stable commit
git reset --hard <commit-hash>
git push --force-with-lease
```

## 📊 Expected Results

After successful deployment:
- ✅ **Server starts without errors**
- ✅ **Authentication endpoints work**
- ✅ **Frontend can connect to backend** 
- ✅ **Redis errors are resolved**
- ✅ **Database connections stable**

## 🔗 Related Files Updated

### Frontend Authentication
- Updated `ShopLogin.jsx` to use `/api/auth/login-seller`
- Removed legacy server imports
- Uses unified authentication endpoints

### Backend Authentication
- All auth routes available at `/api/auth/*`
- Session-based authentication active
- Redis config no longer required

## 📞 Support

If issues persist after following these steps:

1. **Check deployment logs** for specific error messages
2. **Verify environment variables** are correctly set
3. **Test locally first** to ensure code works
4. **Review this cleanup summary**: `CODEBASE_CLEANUP_SUMMARY.md`

---

**Last Updated:** June 10, 2025  
**Status:** Ready for Production Deployment
