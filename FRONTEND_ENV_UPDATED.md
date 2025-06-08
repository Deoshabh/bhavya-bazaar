# 🌐 UPDATED FRONTEND ENVIRONMENT VARIABLES FOR COOLIFY

## Current Frontend Environment Variables (Updated)

Copy these **EXACT** values into your Coolify Panel → Frontend Service → Environment Variables:

```bash
# Build Configuration
CI=false
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
DANGEROUSLY_DISABLE_HOST_CHECK=true

# Domain Configuration
COOKIE_DOMAIN=.bhavyabazaar.com

# CORS Configuration (for reference - mainly used by backend)
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3000,http://localhost:3001

# React App Configuration
REACT_APP_ENV=production
REACT_APP_DEBUG=false
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_EXHIBITOR_FEATURES=true

# API Configuration - All pointing to api subdomain
REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com
REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com

# WebSocket Configuration - CRITICAL FIX
REACT_APP_WS_URL=wss://api.bhavyabazaar.com/socket.io

# Security & Performance
REACT_APP_SECURE=true
REACT_APP_API_TIMEOUT=15000
```

## 🔥 KEY CHANGES FROM YOUR CURRENT CONFIG:

### ✅ Kept (Already Correct):
- `REACT_APP_WS_URL=wss://api.bhavyabazaar.com/socket.io` ✅ 
- `REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2` ✅
- All build and development settings ✅

### ➕ Added (Missing from your current config):
- `REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com`
- `REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com` 
- `REACT_APP_SECURE=true`
- `REACT_APP_API_TIMEOUT=15000`
- Added `https://api.bhavyabazaar.com` to CORS_ORIGIN

## 📋 COMPARISON TABLE

| Variable | Your Current Value | Updated Value | Status |
|----------|-------------------|---------------|--------|
| `CI` | `false` | `false` | ✅ Keep |
| `COOKIE_DOMAIN` | `.bhavyabazaar.com` | `.bhavyabazaar.com` | ✅ Keep |
| `CORS_ORIGIN` | Missing api subdomain | Added `https://api.bhavyabazaar.com` | ➕ Update |
| `REACT_APP_API_URL` | `https://api.bhavyabazaar.com/api/v2` | `https://api.bhavyabazaar.com/api/v2` | ✅ Keep |
| `REACT_APP_WS_URL` | `wss://api.bhavyabazaar.com/socket.io` | `wss://api.bhavyabazaar.com/socket.io` | ✅ Keep |
| `REACT_APP_BACKEND_URL` | ❌ Missing | `https://api.bhavyabazaar.com` | ➕ Add |
| `REACT_APP_SOCKET_URL` | ❌ Missing | `https://api.bhavyabazaar.com` | ➕ Add |
| `REACT_APP_SECURE` | ❌ Missing | `true` | ➕ Add |
| `REACT_APP_API_TIMEOUT` | ❌ Missing | `15000` | ➕ Add |

## 🚀 DEPLOYMENT INSTRUCTIONS

### Step 1: Update Frontend Environment Variables in Coolify
1. Go to **Coolify Panel** → **Services** → **Frontend Service**
2. Click **"Environment Variables"** tab
3. **Add the missing variables:**
   ```bash
   REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com
   REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com
   REACT_APP_SECURE=true
   REACT_APP_API_TIMEOUT=15000
   ```
4. **Update CORS_ORIGIN to include api subdomain:**
   ```bash
   CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3000,http://localhost:3001
   ```

### Step 2: Verify WebSocket Configuration
Ensure this is **exactly** as shown:
```bash
REACT_APP_WS_URL=wss://api.bhavyabazaar.com/socket.io
```

### Step 3: Deploy Frontend Service
1. **Save** environment variables in Coolify
2. **Deploy** the frontend service
3. **Monitor** deployment logs for successful build

## ✅ VERIFICATION

After deployment, your frontend should:
1. **Connect to WebSocket** at `wss://api.bhavyabazaar.com/socket.io`
2. **Make API calls** to `https://api.bhavyabazaar.com/api/v2`
3. **Handle CORS** properly with the updated origin list

## 🔍 TEST WebSocket CONNECTION

After deployment, test in browser console on https://bhavyabazaar.com:

```javascript
// Test WebSocket connection
const socket = io(window.REACT_APP_WS_URL || 'wss://api.bhavyabazaar.com/socket.io', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('🚨 Connection error:', error);
});
```

Your WebSocket fix is almost complete - just add these missing environment variables and redeploy! 🚀
