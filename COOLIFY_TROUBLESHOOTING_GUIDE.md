# Coolify Deployment Troubleshooting Guide

## Current Status
Our recent deployment with critical fixes appears to have deployment issues. All API endpoints are returning 404 errors, suggesting the backend service may not be running properly.

## What We Fixed (That Should Be Working Now)
1. ✅ Port configuration (default to 8000 instead of 443)
2. ✅ CORS production configuration 
3. ✅ Redis connection handling with fallbacks
4. ✅ WebSocket server setup
5. ✅ Authentication error handling
6. ✅ Debug endpoint for troubleshooting

## Immediate Steps to Check in Coolify

### 1. Check Service Status
- Go to your Coolify dashboard
- Check if both frontend and backend services are "Running" (green status)
- If either is red/failed, that's the issue

### 2. Check Backend Logs
Look for these specific startup messages in backend logs:
```
🚀 Server listening on port 8000
🌐 API base: https://api.bhavyabazaar.com
✅ MongoDB connection is successful!
✅ Redis connection is successful! (if Redis is configured)
```

### 3. Common Issues to Look For

#### A. Port Configuration Issue
- Backend should be listening on port 8000
- Coolify should expose this port correctly
- Check if PORT environment variable is set in Coolify

#### B. Environment Variables Missing
Required variables that must be set in Coolify:
```
NODE_ENV=production
DB_URI=(your MongoDB connection string)
JWT_SECRET_KEY=(your JWT secret)
ACTIVATION_SECRET=(your activation secret)
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```

#### C. Build/Startup Errors
Look for error messages like:
- "Required environment variables are missing!"
- MongoDB connection errors
- Module not found errors
- Syntax errors

### 4. Quick Fix Commands

If you need to restart services:
1. In Coolify, go to your backend service
2. Click "Restart" button
3. Monitor the logs during startup

If environment variables are missing:
1. Go to Environment Variables section
2. Add the missing variables from our coolify-environment-variables.env file
3. Restart the service

### 5. Testing After Fixes

Once services are running, test these endpoints:
- `https://api.bhavyabazaar.com/` (should return JSON with API info)
- `https://api.bhavyabazaar.com/api/v2/health` (should return health status)
- `https://api.bhavyabazaar.com/api/v2/debug/env` (our new debug endpoint)
- `https://bhavyabazaar.com` (should load the frontend)

### 6. Next Steps After Services Are Running

1. Run our diagnostic script: `node scripts/accurate-production-test.js`
2. Test user registration and login
3. Verify WebSocket connections
4. Check Redis caching functionality

## Emergency Rollback
If the current deployment is broken, you can:
1. In Coolify, go to "Deployments" 
2. Find the previous working deployment
3. Click "Redeploy" on that version
4. Then we can apply fixes one by one

## Contact Points
- Backend API: https://api.bhavyabazaar.com
- Frontend: https://bhavyabazaar.com
- WebSocket: wss://api.bhavyabazaar.com/ws

The most likely issue is either missing environment variables or a startup error preventing the backend from starting properly.
