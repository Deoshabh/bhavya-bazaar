# Backend Configuration for Coolify Deployment

## Critical Environment Variables to Update in Coolify Panel

### 🔥 IMMEDIATE CHANGES REQUIRED

Navigate to your Coolify panel → Backend Service → Environment Variables and update these:

#### 1. PORT Configuration
```bash
# CHANGE FROM:
PORT=443

# CHANGE TO:
PORT=8000
```
**Why:** Coolify handles SSL termination at the proxy level. Your backend should run on port 8000.

#### 2. CORS_ORIGIN Configuration
```bash
# CHANGE FROM:
CORS_ORIGIN=https://bhavyabazaar.com , https://www.bhavyabazaar.com

# CHANGE TO:
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com
```
**Why:** Remove extra spaces, add api subdomain for WebSocket connections.

#### 3. Remove WS_ORIGIN Variable
```bash
# REMOVE THIS COMPLETELY:
WS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```
**Why:** This conflicts with CORS_ORIGIN. The Socket.IO handler uses CORS_ORIGIN.

### 🔧 Complete Environment Variables List

Here's the complete list of environment variables your backend should have in Coolify:

```bash
# Core Configuration
NODE_ENV=production
PORT=8000

# Database
DB_URI=your-mongodb-connection-string

# JWT & Security
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRES=7d
ACTIVATION_SECRET=your-activation-secret

# CORS - Single source of truth for all origins
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com

# Redis (if using)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Email Configuration
SMPT_HOST=smtp.gmail.com
SMPT_PORT=465
SMPT_PASSWORD=your-email-password
SMPT_MAIL=your-email@gmail.com

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=your-session-secret
```

## 🚀 Deployment Steps

### Step 1: Update Environment Variables in Coolify
1. Go to Coolify Panel → Services → Backend
2. Click on "Environment Variables"
3. Update/Add the variables listed above
4. **Important:** Remove any `WS_ORIGIN` variable if present

### Step 2: Verify Backend Code Changes
The backend code has been updated to:
- ✅ Use PORT 8000 as default instead of 443
- ✅ Trust proxy headers for reverse proxy setup
- ✅ Use single CORS_ORIGIN for both HTTP and WebSocket
- ✅ Remove WS_ORIGIN dependency

### Step 3: Deploy Backend
1. Commit and push your code changes
2. In Coolify, redeploy the backend service
3. Monitor the deployment logs

### Step 4: Deploy Frontend
1. Ensure frontend changes are committed
2. Redeploy frontend service in Coolify
3. Monitor deployment logs

## 🧪 Testing WebSocket Connection

After deployment, test the WebSocket connection:

### Browser Console Test
```javascript
const socket = io('wss://api.bhavyabazaar.com', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('🚨 Connection error:', error);
});
```

### Expected Flow
```
Frontend → wss://api.bhavyabazaar.com/socket.io → Coolify Proxy → Backend:8000
```

## 🔍 Troubleshooting

### Check Backend Logs
In Coolify panel, check backend service logs for:
```bash
🚀 Server listening on port 8000
🌐 API base: https://api.bhavyabazaar.com
🌐 Allowed CORS origins: [array of origins]
```

### Check Frontend Logs
In browser console, look for:
```bash
WebSocket connection to 'wss://api.bhavyabazaar.com/socket.io/' 
✅ WebSocket connected
```

### Common Issues & Solutions

#### Issue: Still connecting to old WebSocket URL
**Solution:** Clear browser cache, ensure latest frontend is deployed

#### Issue: CORS errors in backend logs
**Solution:** Verify CORS_ORIGIN has no extra spaces and includes all required domains

#### Issue: WebSocket fails to connect
**Solution:** Check that both frontend and backend are deployed with latest changes

## 📊 Verification Checklist

- [ ] Backend PORT changed from 443 to 8000
- [ ] CORS_ORIGIN updated with proper formatting
- [ ] WS_ORIGIN variable removed
- [ ] Backend redeployed successfully
- [ ] Frontend redeployed successfully
- [ ] WebSocket connects to `wss://api.bhavyabazaar.com/socket.io`
- [ ] No CORS errors in backend logs
- [ ] Real-time features working (messages, notifications)

## 🎯 Final Notes

This configuration leverages Coolify's built-in reverse proxy capabilities:
- Coolify handles SSL termination
- Backend runs on HTTP port 8000
- WebSocket connections are proxied through `api.bhavyabazaar.com`
- All CORS origins are centrally managed

The WebSocket fix is now complete and production-ready for Coolify deployment!
