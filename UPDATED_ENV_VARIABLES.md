# 🔧 UPDATED ENVIRONMENT VARIABLES FOR COOLIFY

## 🚀 BACKEND SERVICE - Environment Variables

Copy these **EXACT** values into your Coolify Panel → Backend Service → Environment Variables:

```bash
# Core Configuration
NODE_ENV=production
PORT=8000
ENABLE_CACHE_WARMING=true

# Database Configuration
DB_URI=mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin

# JWT & Security Configuration
JWT_SECRET_KEY=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
JWT_EXPIRES=7d
ACTIVATION_SECRET=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
SESSION_SECRET=d025bc0cc32caef23fc9c85211b78a6f730edbc321e601422f27f2587eedab17

# CORS Configuration - CRITICAL FOR WEBSOCKET
CORS_ORIGIN=https://www.bhavyabazaar.com,https://bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3000

# Redis Configuration
REDIS_HOST=r0sssg8g8wog48ggcgc0s4go
REDIS_PORT=6379
REDIS_PASSWORD=ey66XSWpPTBQuAzKdWRWBD3oHwr5p4iSUie5DRoLoIKgeZM4YZoSufSQEw9Mp3c4
REDIS_DB=0
```

### 🔥 CRITICAL CHANGES FROM PREVIOUS CONFIG:

1. **PORT:** Changed from `443` → `8000` ✅
2. **CORS_ORIGIN:** Fixed formatting, removed extra spaces, added api subdomain ✅  
3. **WS_ORIGIN:** Completely removed (was causing conflicts) ✅

---

## 🌐 FRONTEND SERVICE - Environment Variables

Copy these **EXACT** values into your Coolify Panel → Frontend Service → Environment Variables:

```bash
# Production Configuration
NODE_ENV=production
HTTPS=true
GENERATE_SOURCEMAP=false

# API Configuration - All pointing to api subdomain
REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com
REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com
REACT_APP_WS_URL=wss://api.bhavyabazaar.com/socket.io
REACT_APP_API_TIMEOUT=15000

# Security Configuration
REACT_APP_SECURE=true
REACT_APP_DEBUG_MODE=false
```

### 🔥 CRITICAL CHANGES FROM PREVIOUS CONFIG:

1. **REACT_APP_WS_URL:** Changed from `wss://bhavyabazaar.com/socket.io` → `wss://api.bhavyabazaar.com/socket.io` ✅
2. **All API URLs:** Point to `api.bhavyabazaar.com` subdomain ✅

---

## 📋 DEPLOYMENT STEPS

### Step 1: Update Backend Environment Variables
1. Go to **Coolify Panel** → **Services** → **Backend Service**
2. Click **"Environment Variables"** tab
3. **Delete/Update these variables:**
   - Change `PORT` from `443` to `8000`
   - Update `CORS_ORIGIN` (remove spaces, add api subdomain)
   - **DELETE** `WS_ORIGIN` completely if it exists
4. **Save changes**

### Step 2: Update Frontend Environment Variables  
1. Go to **Coolify Panel** → **Services** → **Frontend Service**
2. Click **"Environment Variables"** tab
3. **Update these variables:**
   - Change `REACT_APP_WS_URL` to use `api.bhavyabazaar.com`
   - Ensure all API URLs use `api.bhavyabazaar.com`
4. **Save changes**

### Step 3: Deploy Services
1. **Deploy Backend Service**
   - Go to Backend Service → Click **"Deploy"**
   - Wait for deployment to complete
   - Check logs for: `🚀 Server listening on port 8000`

2. **Deploy Frontend Service**
   - Go to Frontend Service → Click **"Deploy"**  
   - Wait for build to complete
   - Check for successful deployment

### Step 4: Test WebSocket Connection
Open browser console on https://bhavyabazaar.com and run:

```javascript
const socket = io('wss://api.bhavyabazaar.com', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('🚨 Connection error:', error);
});
```

---

## 🎯 EXPECTED RESULTS

### ✅ Backend Logs Should Show:
```bash
🚀 Server listening on port 8000
🌐 API base: https://api.bhavyabazaar.com
🌐 Allowed CORS origins: [
  "https://www.bhavyabazaar.com",
  "https://bhavyabazaar.com", 
  "https://api.bhavyabazaar.com",
  "http://localhost:3000"
]
✅ Redis connection initialized
```

### ✅ Frontend Should Connect:
```bash
WebSocket connection to 'wss://api.bhavyabazaar.com/socket.io/'
✅ WebSocket connected: [socket-id]
```

### ✅ Traffic Flow:
```
Frontend (bhavyabazaar.com) 
    ↓
wss://api.bhavyabazaar.com/socket.io 
    ↓  
Coolify Reverse Proxy (handles SSL)
    ↓
Backend Container (HTTP port 8000)
    ↓
✅ WebSocket Connection Established
```

---

## 🔍 VARIABLES TO REMOVE

Make sure these variables are **DELETED** from Coolify if they exist:

❌ **Backend Service:**
- `WS_ORIGIN` (causes conflicts with CORS_ORIGIN)

❌ **Frontend Service:**  
- Any old WebSocket URLs pointing to `bhavyabazaar.com:3005`

---

## 📞 NEED HELP?

If you encounter issues:

1. **Check Coolify Logs** - Look for CORS errors or connection failures
2. **Clear Browser Cache** - Hard refresh (Ctrl+F5) 
3. **Verify Environment Variables** - Ensure no typos or extra spaces
4. **Test Step by Step** - Deploy backend first, then frontend

The WebSocket fix is complete - just apply these environment variables in Coolify! 🚀
