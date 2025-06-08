# Coolify WebSocket Configuration Guide

## 🎯 Problem Overview
WebSocket connections failing on Coolify deployment because:
- Frontend trying to connect to `wss://api.bhavyabazaar.com:3005/socket.io` 
- Coolify's reverse proxy doesn't expose backend ports directly
- Need to route WebSocket through main domain with proper proxy setup

## ✅ Solution for Coolify

### 1. **Coolify Panel Configuration**

#### Frontend Environment Variables:
```env
REACT_APP_WS_URL=wss://bhavyabazaar.com/socket.io
REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
NODE_ENV=production
```

#### Backend Environment Variables:
```env
NODE_ENV=production
PORT=3005
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com
DB_URI=your-mongodb-connection-string
JWT_SECRET_KEY=your-jwt-secret
ACTIVATION_SECRET=your-activation-secret
```

### 2. **Coolify Service Configuration**

#### Frontend Service:
- **Type:** Static Site or Node.js
- **Domain:** `bhavyabazaar.com`
- **Build Command:** `npm run build`
- **Publish Directory:** `build/`

#### Backend Service:
- **Type:** Node.js
- **Domain:** `api.bhavyabazaar.com`
- **Port:** `3005`
- **Start Command:** `npm start`

### 3. **Coolify Proxy Configuration**

In your Coolify panel, you need to add custom proxy rules for WebSocket:

#### For Frontend Domain (bhavyabazaar.com):
Add these custom configurations in Coolify:

**Custom Nginx Config** (if Coolify allows):
```nginx
location /socket.io/ {
    proxy_pass http://api.bhavyabazaar.com/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /ws {
    proxy_pass http://api.bhavyabazaar.com/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 4. **Alternative: Backend Subdomain Approach**

If custom proxy rules aren't available, use backend subdomain:

**Update runtime-config.js:**
```javascript
window.__RUNTIME_CONFIG__ = {
  SOCKET_URL: "wss://api.bhavyabazaar.com/socket.io",
  // ... other config
};
```

**Backend CORS Update:**
```javascript
// In backend/socket/socketHandler.js
const allowedOrigins = [
  "https://bhavyabazaar.com",
  "https://www.bhavyabazaar.com",
  "https://api.bhavyabazaar.com"
];
```

### 5. **Deployment Steps**

1. **Update Code:**
   - Commit the runtime-config.js changes
   - Push to your repository

2. **Coolify Panel:**
   - Set environment variables for both services
   - Redeploy both frontend and backend
   - Ensure both services are running

3. **Test Connection:**
   - Open browser to `https://bhavyabazaar.com`
   - Open Developer Tools console
   - Check for WebSocket connection logs

### 6. **Testing WebSocket Connection**

Use this in browser console on your live site:
```javascript
// Test WebSocket connection
const wsUrl = 'wss://bhavyabazaar.com/socket.io';
console.log('Testing:', wsUrl);

const socket = io(wsUrl, {
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ Connected!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error);
});
```

### 7. **Troubleshooting**

**Check Coolify Logs:**
- Go to your backend service in Coolify
- Check the "Logs" tab for WebSocket connection attempts

**Common Issues:**
1. **CORS Error:** Add all domains to CORS_ORIGIN
2. **404 on /socket.io:** Backend service not receiving requests
3. **SSL Issues:** Ensure Coolify SSL is properly configured

**Verify Services:**
- Frontend: `https://bhavyabazaar.com` loads correctly
- Backend: `https://api.bhavyabazaar.com/api/v2/health` returns 200
- WebSocket: Browser console shows successful connection

### 8. **Expected URLs After Fix**

**Working URLs:**
- Frontend: `https://bhavyabazaar.com`
- API: `https://api.bhavyabazaar.com/api/v2/*`
- WebSocket: `wss://bhavyabazaar.com/socket.io` OR `wss://api.bhavyabazaar.com/socket.io`

The key is ensuring Coolify's reverse proxy properly routes WebSocket connections to your backend service.
