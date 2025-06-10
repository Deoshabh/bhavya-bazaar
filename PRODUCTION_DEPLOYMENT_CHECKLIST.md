# 🚀 Production Deployment Checklist - Bhavya Bazaar

## ✅ IMMEDIATE STEPS TO RESOLVE 502 ERRORS

### 1. **Coolify Backend Service Status**
- [ ] Log into Coolify dashboard
- [ ] Navigate to backend service
- [ ] Check service status (should be "Running")
- [ ] Verify last deployment was successful
- [ ] Check deployment logs for errors

### 2. **Backend Health Verification**
After backend is running, test these endpoints:
- [ ] `https://api.bhavyabazaar.com/api/ping` - Should return 200 OK
- [ ] `https://api.bhavyabazaar.com/api/cors-debug` - Should show CORS config
- [ ] `https://api.bhavyabazaar.com/api/v2/debug/env` - Should show environment status

### 3. **Environment Variables Verification**
Ensure these are set in Coolify backend service:
```bash
NODE_ENV=production
PORT=8000
DB_URI=mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin
SESSION_SECRET=d025bc0cc32caef23fc9c85211b78a6f730edbc321e601422f27f2587eedab17
COOKIE_DOMAIN=.bhavyabazaar.com
JWT_SECRET_KEY=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
JWT_EXPIRES=7d
ACTIVATION_SECRET=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com
REDIS_HOST=r0sssg8g8wog48ggcgc0s4go
REDIS_PORT=6379
REDIS_PASSWORD=ey66XSWpPTBQuAzKdWRWBD3oHwr5p4iSUie5DRoLoIKgeZM4YZoSufSQEw9Mp3c4
REDIS_DB=0
ADMIN_SECRET_KEY=bhavya_bazaar_admin_2025_secure_key
AUTH_RATE_LIMIT_MAX=20
AUTH_RATE_LIMIT_WINDOW=900000
```

### 4. **Frontend Environment Variables**
Ensure these are set in Coolify frontend service:
```bash
REACT_APP_SERVER=https://api.bhavyabazaar.com
REACT_APP_ENVIRONMENT=production
REACT_APP_WEBSOCKET_URL=wss://api.bhavyabazaar.com
PUBLIC_URL=https://bhavyabazaar.com
```

### 5. **Domain & SSL Configuration**
- [ ] Backend domain: `api.bhavyabazaar.com` points to backend service
- [ ] Frontend domain: `bhavyabazaar.com` points to frontend service
- [ ] SSL certificates are active for both domains
- [ ] DNS propagation is complete

### 6. **Service Configuration**
- [ ] Backend service port is set to 8000
- [ ] Frontend service is built and deployed successfully
- [ ] No port conflicts or resource limitations

## 🔧 TROUBLESHOOTING COMMANDS

If you have terminal access to the Coolify server:

```bash
# Check if services are running
docker ps | grep bhavya

# Check backend service logs
docker logs [backend-container-id] --tail=50

# Check frontend service logs  
docker logs [frontend-container-id] --tail=50

# Test backend health from server
curl -I https://api.bhavyabazaar.com/api/ping

# Test CORS from server
curl -H "Origin: https://bhavyabazaar.com" https://api.bhavyabazaar.com/api/cors-debug
```

## 🚨 CRITICAL ERRORS TO LOOK FOR

### Backend Logs:
- MongoDB connection errors
- Redis connection failures
- Port binding issues
- Environment variable missing errors
- SSL/TLS certificate issues

### Frontend Logs:
- Build failures
- Missing environment variables
- Static file serving issues

## 📞 ESCALATION

If the above steps don't resolve the issue:
1. Check Coolify server resources (CPU, memory, disk space)
2. Verify network connectivity between services
3. Check firewall/security group settings
4. Contact Coolify support or hosting provider
5. Consider temporarily switching to a backup deployment

## ✅ SUCCESS INDICATORS

Once fixed, you should see:
- [ ] No 502 errors in browser console
- [ ] Successful login/logout functionality
- [ ] WebSocket connections working
- [ ] API requests returning proper CORS headers
- [ ] All features working as expected

## 🔄 POST-FIX VERIFICATION

Test these critical user flows:
- [ ] User registration and login
- [ ] Seller registration and login
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Logout functionality (the original request!)
- [ ] Admin panel access
