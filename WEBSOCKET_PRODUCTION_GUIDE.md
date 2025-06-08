# Production WebSocket Deployment Guide for Bhavya Bazaar

This guide provides complete setup instructions for deploying the Bhavya Bazaar application with production-ready WebSocket support.

## 🎯 Overview

The WebSocket fix implements:
- ✅ Frontend environment variable configuration (`REACT_APP_WS_URL`)
- ✅ Backend Socket.IO with proper CORS configuration
- ✅ Nginx reverse proxy for WebSocket connections
- ✅ SSL/TLS support for secure WebSocket connections (WSS)
- ✅ Production-ready error handling and reconnection logic

## 🏗️ Architecture

```
┌─────────────────┐    HTTPS/WSS     ┌──────────────┐    HTTP/WS    ┌─────────────┐
│   Frontend      │ ◄─────────────► │    Nginx     │ ◄──────────► │   Backend   │
│ bhavyabazaar.com│                  │ Reverse Proxy│               │ localhost   │
│ (Port 443)      │                  │ (Port 443)   │               │ (Port 3005) │
└─────────────────┘                  └──────────────┘               └─────────────┘
```

## 📁 File Changes Summary

### Frontend Changes
1. **`.env.production`** - Added `REACT_APP_WS_URL=wss://bhavyabazaar.com/socket.io`
2. **`src/server.js`** - Updated WebSocket URL resolution to use reverse proxy
3. **`WebSocketClient.js`** - Already configured properly (no changes needed)

### Backend Changes
1. **`socket/socketHandler.js`** - Updated CORS origins for production
2. **`server.js`** - Enhanced CORS configuration for WebSocket connections
3. **`.env.production`** - Created production environment template

### Infrastructure
1. **`nginx.conf`** - Complete Nginx configuration with WebSocket proxy
2. **`deploy-production.sh`** - Automated deployment script

## 🚀 Deployment Steps

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx nodejs npm mongodb redis-server certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Application Setup

```bash
# Clone or copy your application
git clone https://github.com/your-repo/bhavya-bazaar.git
cd bhavya-bazaar

# Run automated deployment script
chmod +x deploy-production.sh
./deploy-production.sh
```

### Step 3: Manual Configuration (if not using script)

#### Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install --production

# Copy environment file
cp .env.production .env

# Edit .env with your actual values
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=3005
DB_URI=mongodb://localhost:27017/bhavya-bazaar
JWT_SECRET_KEY=your-super-secret-jwt-key
ACTIVATION_SECRET=your-activation-secret
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```

#### Frontend Configuration

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

#### Nginx Configuration

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/bhavyabazaar

# Enable site
sudo ln -sf /etc/nginx/sites-available/bhavyabazaar /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: SSL Certificate Setup

```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d bhavyabazaar.com -d www.bhavyabazaar.com

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 5: Start Services

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Start backend with PM2
cd /var/www/bhavyabazaar
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔧 Configuration Details

### WebSocket URLs

**Development:**
- Socket.IO: `ws://localhost:8000/socket.io`
- Native WS: `ws://localhost:8000/ws`

**Production:**
- Socket.IO: `wss://bhavyabazaar.com/socket.io`
- Native WS: `wss://bhavyabazaar.com/ws`

### Environment Variables

**Frontend (`.env.production`):**
```env
REACT_APP_WS_URL=wss://bhavyabazaar.com/socket.io
REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
NODE_ENV=production
```

**Backend (`.env`):**
```env
NODE_ENV=production
PORT=3005
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```

### Nginx Proxy Configuration

Key configuration sections in `nginx.conf`:

```nginx
# Socket.IO WebSocket proxy
location /socket.io/ {
    proxy_pass http://localhost:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Native WebSocket proxy
location /ws {
    proxy_pass http://localhost:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🧪 Testing WebSocket Connections

### Browser Console Test

1. Open your browser and navigate to `https://bhavyabazaar.com`
2. Open Developer Tools (F12) and go to Console
3. Copy and paste the contents of `websocket-test-browser.js`
4. Check console output for connection status

### Expected Results

**Successful Connection:**
```
✅ WebSocket connected successfully!
📨 Received WebSocket message: {"type":"welcome","message":"Connected to Bhavya Bazaar WebSocket","timestamp":"..."}
```

**Connection Error:**
```
❌ WebSocket error: Error: ...
```

### Troubleshooting Connection Issues

1. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

2. **Check backend logs:**
   ```bash
   pm2 logs bhavya-bazaar-backend
   ```

3. **Verify services are running:**
   ```bash
   sudo systemctl status nginx
   pm2 status
   ```

4. **Test backend directly:**
   ```bash
   curl -I http://localhost:3005/api/v2/health
   ```

## 🔍 Monitoring and Maintenance

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs bhavya-bazaar-backend

# Restart application
pm2 restart bhavya-bazaar-backend

# Reload with zero downtime
pm2 reload bhavya-bazaar-backend

# Monitor resources
pm2 monit
```

### Log Files

- **Nginx Access:** `/var/log/nginx/access.log`
- **Nginx Error:** `/var/log/nginx/error.log`
- **Application:** `~/logs/backend-*.log` (via PM2)
- **MongoDB:** `/var/log/mongodb/mongod.log`

## 🛡️ Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   # Update SSL certificates
   sudo certbot renew

   # Update application dependencies
   npm audit fix
   ```

3. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong, unique secrets for JWT and session keys
   - Regularly rotate secrets

## 📊 Performance Optimization

1. **Nginx Caching:** Already configured for static assets
2. **Gzip Compression:** Enabled in nginx configuration
3. **PM2 Clustering:** Configured to use all available CPU cores
4. **Connection Limits:** Rate limiting configured in nginx

## 🎉 Success Indicators

After deployment, you should see:

1. ✅ Application accessible at `https://bhavyabazaar.com`
2. ✅ SSL certificate valid and secure
3. ✅ WebSocket connections working (test with browser console)
4. ✅ No CORS errors in browser console
5. ✅ Real-time features functioning (messaging, notifications)

## 🆘 Common Issues and Solutions

### Issue: WebSocket connection fails with CORS error

**Solution:** Verify CORS_ORIGIN environment variable includes your domain:
```env
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com
```

### Issue: SSL certificate errors

**Solution:** Ensure certificate paths are correct in nginx configuration and certificates are valid.

### Issue: Backend not accessible

**Solution:** Check if backend is running on correct port:
```bash
pm2 status
netstat -tlnp | grep 3005
```

### Issue: Nginx 502 Bad Gateway

**Solution:** Backend service is down or not responding:
```bash
pm2 restart bhavya-bazaar-backend
sudo systemctl reload nginx
```

## 📞 Support

For additional support:
1. Check application logs first
2. Verify all services are running
3. Test WebSocket connections using provided scripts
4. Review this guide for missed configuration steps

---

**Last Updated:** June 8, 2025
**Version:** 1.0.0
