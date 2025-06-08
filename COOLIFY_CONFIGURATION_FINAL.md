# 🚀 Coolify Configuration for Bhavya Bazaar

## ⚠️ IMPORTANT: Port Configuration Update

**Due to ports 80, 3000, 3001, 3002, 3003 being taken by other projects:**
- **Frontend Internal Port**: `3004`
- **Backend Internal Port**: `8000`

## 📦 Frontend Container Configuration

### **General Settings:**
- **Name**: `bhavyabazaar-frontend`
- **Build Pack**: `Node.js`
- **Base Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npm run serve:spa`
- **Internal Port**: `3004` ⚠️ **Updated to avoid conflicts**
- **Public Port**: `443` (HTTPS)
- **Public Directory**: Leave empty (Node.js serves from build/)

### **Environment Variables for Frontend:**
```bash
NODE_ENV=production
PORT=3004
GENERATE_SOURCEMAP=false
CI=false
```

### **Domain Setup:**
- **Domain**: `bhavyabazaar.com`
- **Protocol**: HTTPS
- **Auto-redirect HTTP to HTTPS**: Enabled

---

## 🔧 Backend Container Configuration

### **General Settings:**
- **Name**: `bhavyabazaar-backend`
- **Build Pack**: `Node.js`
- **Base Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Internal Port**: `8000`
- **Public Port**: `443` (HTTPS)

### **Environment Variables for Backend:**
```bash
NODE_ENV=production
PORT=8000

# Database Configuration
MONGO_DB_URI=mongodb://[your-mongodb-connection-string]

# JWT Configuration
JWT_SECRET=[your-jwt-secret-key]
JWT_EXPIRES_TIME=7d
ACTIVATION_SECRET=[your-activation-secret]

# Cloudinary Configuration
CLOUDINARY_CONFIG_CLOUD_NAME=[your-cloudinary-name]
CLOUDINARY_CONFIG_API_KEY=[your-cloudinary-key]
CLOUDINARY_CONFIG_API_SECRET=[your-cloudinary-secret]

# Redis Configuration
REDIS_URL=redis://[your-redis-url]:6379
REDIS_HOST=[your-redis-host]
REDIS_PORT=6379
REDIS_PASSWORD=[your-redis-password]

# CORS Configuration
CORS_ORIGIN=https://bhavyabazaar.com
FRONTEND_URL=https://bhavyabazaar.com
BACKEND_URL=https://api.bhavyabazaar.com

# Email Configuration
SMTP_HOST=[your-email-host]
SMTP_PORT=587
SMTP_PASSWORD=[your-email-password]
SMTP_MAIL=[your-email-address]

# Payment Configuration
STRIPE_API_KEY=[your-stripe-key]
STRIPE_SECRET_KEY=[your-stripe-secret]
```

### **Domain Setup:**
- **Domain**: `api.bhavyabazaar.com`
- **Protocol**: HTTPS
- **Auto-redirect HTTP to HTTPS**: Enabled

---

## 🔗 Network Configuration

### **Internal Network Communication:**
Both containers should be on the same Docker network for internal communication:
- Frontend can access backend via: `http://bhavyabazaar-backend:8000`
- Backend allows CORS from: `https://bhavyabazaar.com`

### **Socket.IO Configuration Fix:**
The updated configuration resolves socket errors when switching from static to dynamic frontend:

1. **Socket URL**: Uses `https://api.bhavyabazaar.com` (not wss://)
2. **Transport Fallback**: Starts with polling, upgrades to websocket
3. **Connection Cleanup**: Properly handles existing connections
4. **Runtime Config**: Gets socket URL from `window.__RUNTIME_CONFIG__`

---

## 🛠️ Deployment Steps

### 1. **Update Frontend Configuration**
- Port changed to 3004 ✅
- Socket configuration updated ✅
- Runtime config optimized ✅

### 2. **Deploy Frontend Container**
```bash
# In Coolify Frontend settings:
Build Command: npm run build
Start Command: npm run serve:spa
Port: 3004
```

### 3. **Deploy Backend Container**
```bash
# In Coolify Backend settings:
Build Command: npm install
Start Command: npm start
Port: 8000
```

### 4. **Verify Deployment**
- **Frontend**: https://bhavyabazaar.com
- **Backend**: https://api.bhavyabazaar.com
- **Health Check**: https://bhavyabazaar.com/health

---

## 🐛 Socket Error Resolution

### **Previous Issue:**
When switching from static to dynamic frontend, socket connections failed due to:
- Hard-coded websocket URLs
- Connection conflicts with existing sockets
- Transport negotiation failures

### **Solution Applied:**
1. **Dynamic Socket URL**: Uses runtime config instead of hardcoded values
2. **Connection Cleanup**: Properly disconnects existing sockets before creating new ones
3. **Transport Strategy**: Starts with polling for compatibility, upgrades to websocket
4. **Error Handling**: Progressive fallback strategies with detailed logging

### **Socket Connection Flow:**
```javascript
// 1. Get URL from runtime config
const SOCKET_URL = window.__RUNTIME_CONFIG__.SOCKET_URL;

// 2. Clean up existing connections
if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
}

// 3. Create new connection with fallback transports
socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    // ... other options
});
```

---

## ✅ Validation Checklist

### **Before Deployment:**
- [ ] Port 3004 is available for frontend
- [ ] Port 8000 is available for backend
- [ ] Environment variables are set correctly
- [ ] Domain DNS is pointing to Coolify server

### **After Deployment:**
- [ ] Frontend loads at https://bhavyabazaar.com
- [ ] Backend API responds at https://api.bhavyabazaar.com/api/v2
- [ ] Socket.IO connects without errors
- [ ] Authentication flow works completely
- [ ] No 404 errors on page refresh (SPA routing works)

### **Socket Connection Verification:**
```javascript
// Run in browser console:
console.log('Socket URL:', window.__RUNTIME_CONFIG__.SOCKET_URL);
// Should show: "https://api.bhavyabazaar.com"
```

---

## 🚨 Emergency Rollback

If deployment fails:
1. **Frontend Issues**: Revert to static build deployment
2. **Backend Issues**: Check environment variables and database connections
3. **Socket Issues**: Check CORS_ORIGIN includes frontend domain

**Contact Info**: Keep deployment logs and error messages for troubleshooting.
