# 🚨 EMERGENCY DEPLOYMENT FIX - Backend Down (502 Error)

## Immediate Actions Required

### 1. **CRITICAL: Restart Backend Service in Coolify**

The backend API server at `https://api.bhavyabazaar.com` is returning **502 Bad Gateway** errors. This means the service is completely down.

**IMMEDIATE STEPS:**
1. Log into your Coolify dashboard
2. Navigate to the backend service (api.bhavyabazaar.com)
3. **RESTART THE SERVICE** immediately
4. Check the service logs for startup errors

### 2. **Environment Variables Check**

Ensure these environment variables are set in Coolify production:

```env
# Database
NODE_ENV=production
DB_URI=mongodb+srv://your-cluster-connection-string
PORT=8000

# JWT & Security
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRES=7d
ACTIVATION_SECRET=your-activation-secret

# CORS Configuration - CRITICAL FOR FRONTEND
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com

# Redis Configuration
REDIS_HOST=r0sssg8g8wog48ggcgc0s4go
REDIS_PORT=6379
REDIS_PASSWORD=ey66XSWpPTBQuAzKdWRWBD3oHwr5p4iSUie5DRoLoIKgeZM4YZoSufSQEw9Mp3c4
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your-session-secret
```

### 3. **CORS Fix Applied**

✅ **Fixed** - The backend CORS configuration has been updated to:
- Always include `https://bhavyabazaar.com` and `https://www.bhavyabazaar.com` in production
- Better logging for CORS debugging
- Support for all required headers

### 4. **Verification Steps After Restart**

1. **Check backend health:**
   ```bash
   curl -I https://api.bhavyabazaar.com/api/v2/health
   ```
   Should return `200 OK`

2. **Check CORS headers:**
   ```bash
   curl -H "Origin: https://bhavyabazaar.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://api.bhavyabazaar.com/api/v2/health
   ```
   Should return CORS headers

3. **Test frontend connection:**
   Visit `https://bhavyabazaar.com` and check browser console for errors

### 5. **Backend Service Logs to Check**

After restart, look for these in Coolify logs:

✅ **Good signs:**
```
✅ MongoDB connected successfully
✅ Redis connection initialized
🚀 Server listening on port 8000
🌐 Allowed CORS origins: [https://bhavyabazaar.com, ...]
✅ Trust proxy configured
```

❌ **Bad signs:**
```
❌ MongoDB connection failed
❌ Redis initialization failed
❌ Required environment variables are missing
```

### 6. **If Backend Still Won't Start**

Check these common issues:

1. **MongoDB Connection**: Verify DB_URI is correct and cluster is accessible
2. **Redis Connection**: Verify Redis credentials and network access
3. **Environment Variables**: Ensure all required vars are set
4. **Port Configuration**: Should be `PORT=8000`
5. **Memory/Resources**: Check if service has enough allocated resources

### 7. **Emergency Fallback**

If backend service keeps failing, as a temporary measure:

1. Check Coolify resource allocation (increase memory if needed)
2. Try redeploying from the latest commit
3. Check Docker logs for specific startup errors
4. Verify network connectivity between services

---

## Current Status

- ❌ **Backend API**: DOWN (502 Bad Gateway)
- ✅ **Frontend**: UP (https://bhavyabazaar.com)
- ✅ **CORS Fix**: APPLIED
- ❌ **User/Seller Login**: BROKEN (no backend)
- ❌ **Logout Functionality**: BROKEN (no backend)

## Files Modified for CORS Fix

- `backend/server.js` - Enhanced CORS configuration with better logging
- `backend/.env.production` - Updated CORS origins

## Next Steps After Backend Restart

1. Test user login/logout functionality
2. Test seller login/logout functionality
3. Verify session management is working
4. Check rate limiting is functioning properly

---

**⚠️ CRITICAL: The frontend logout functionality is implemented and ready - it just needs the backend to be running!**
