# 🚀 Switch to Dynamic Node.js Frontend Deployment

## Overview
Switch from static nginx deployment to dynamic Node.js deployment to fix SPA routing issues.

## ✅ What This Fixes
- **No more 404 errors** on routes like `/login`, `/profile` when refreshing the page
- **No more logout** when users navigate directly to URLs
- **Proper SPA routing** - all React routes will work correctly
- **Better caching control** for runtime configuration

## 📋 Files Updated
- ✅ `production-server.js` - Port changed to 3004 (avoiding 3000-3003)
- ✅ `Dockerfile.nodejs` - Port changed to 3004
- ✅ Health check endpoint configured for port 3004

## 🔧 Coolify Configuration Changes

### 1. Update Service Settings
In your Coolify dashboard for the frontend service:

```yaml
# Build Configuration
Dockerfile: frontend/Dockerfile.nodejs  # Changed from frontend/Dockerfile
Build Context: ./frontend
Build Args: (keep existing if any)

# Runtime Configuration  
Port: 3004                             # Changed from 80/3000
Health Check Path: /health
Health Check Port: 3004

# Environment Variables (add these)
PORT: "3004"
NODE_ENV: "production"
```

### 2. Domain Configuration
Keep your existing domain configuration:
- **Domain**: `bhavyabazaar.com` (or your domain)
- **External Port**: 80 (HTTP) or 443 (HTTPS)
- **Internal Port**: 3004

### 3. Service Type
- **Type**: Application (not Static Site)
- **Framework**: Node.js

## 🚀 Deployment Steps

### Step 1: Test Locally (Optional but Recommended)
```powershell
# From project root
cd frontend
.\test-nodejs-3004.ps1
```

### Step 2: Full Build and Test
```powershell
# From project root
.\deploy-nodejs-frontend-3004.ps1
```

### Step 3: Update Coolify
1. Go to your Coolify dashboard
2. Select your frontend service
3. Update the configuration as shown above
4. Deploy the changes

## 🔍 Verification

After deployment, test these URLs:
- ✅ `https://yourdomain.com/health` - Should return JSON health status
- ✅ `https://yourdomain.com/` - Should load the homepage
- ✅ `https://yourdomain.com/login` - Should load login page (not 404!)
- ✅ `https://yourdomain.com/profile` - Should load profile page (not 404!)

## 🎯 Key Benefits

### Before (Static nginx):
- ❌ `/login` → 404 on page refresh
- ❌ `/profile` → 404 on page refresh  
- ❌ Users get logged out when navigating to routes
- ❌ Poor SPA routing support

### After (Node.js Express):
- ✅ `/login` → Works on page refresh
- ✅ `/profile` → Works on page refresh
- ✅ Users stay logged in
- ✅ Perfect SPA routing with fallback to `index.html`

## 🛠️ Technical Details

### Port Configuration
- **Internal Container Port**: 3004
- **External Access**: 80/443 (configured in Coolify)
- **Health Check**: `GET /health` on port 3004

### Server Features
- **SPA Routing**: All routes fallback to `index.html`
- **Static File Serving**: Build files served with caching
- **Runtime Config**: Special handling for `runtime-config.js` (no cache)
- **Security Headers**: XSS protection, content type options
- **Compression**: Gzip compression enabled
- **Health Monitoring**: `/health` endpoint for Coolify

### Docker Image
- **Base**: `node:18-alpine`
- **Multi-stage**: Build stage + production stage
- **Security**: Non-root user
- **Size**: Optimized production image

## ⚠️ Important Notes

1. **Port Conflict**: Using 3004 because 3000-3003 are taken on your VPS
2. **No Breaking Changes**: API calls still go to `api.bhavyabazaar.com`
3. **Caching**: Static assets cached for 1 year, HTML files not cached
4. **Environment**: Compatible with existing environment variables

## 🆘 Troubleshooting

### If deployment fails:
1. Check Coolify logs for port conflicts
2. Verify `Dockerfile.nodejs` is being used
3. Confirm port 3004 is not already in use

### If SPA routing still doesn't work:
1. Check health endpoint: `/health`
2. Verify server logs in Coolify
3. Test a specific route like `/login`

### If you need to rollback:
1. Change Dockerfile back to `frontend/Dockerfile`
2. Change port back to 80
3. Redeploy

## 🎉 Success Criteria

✅ Health check returns: `{"status":"healthy","service":"frontend"}`  
✅ Direct navigation to `/login` works without 404  
✅ Page refresh on `/profile` doesn't log users out  
✅ All React routes accessible via direct URL  

This deployment will completely fix your SPA routing and authentication persistence issues!
