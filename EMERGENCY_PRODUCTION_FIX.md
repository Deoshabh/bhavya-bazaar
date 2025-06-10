# 🚨 EMERGENCY PRODUCTION DEPLOYMENT FIX

## CRITICAL ISSUES IDENTIFIED:
1. Backend API service is DOWN (502 Bad Gateway)
2. CORS headers not being sent to frontend
3. WebSocket connections failing

## IMMEDIATE ACTIONS REQUIRED:

### 1. COOLIFY BACKEND SERVICE CHECK
1. Log into your Coolify dashboard
2. Navigate to the backend service
3. Check if the service is running and healthy
4. Verify the deployment logs for errors

### 2. BACKEND ENVIRONMENT VARIABLES
Apply these environment variables to your Coolify backend service:

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
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=12
ENABLE_CACHE_WARMING=true
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@bhavyabazaar.com
```

### 3. FRONTEND ENVIRONMENT VARIABLES
Apply these environment variables to your Coolify frontend service:

```bash
REACT_APP_SERVER=https://api.bhavyabazaar.com
REACT_APP_ENVIRONMENT=production
REACT_APP_WEBSOCKET_URL=wss://api.bhavyabazaar.com
PUBLIC_URL=https://bhavyabazaar.com
```

### 4. COOLIFY DEPLOYMENT STEPS:
1. **Backend Service**:
   - Check if backend container is running
   - Verify port 8000 is exposed
   - Ensure domain `api.bhavyabazaar.com` is correctly mapped
   - Check if SSL certificate is active
   - Review deployment logs for errors

2. **Frontend Service**:
   - Verify domain `bhavyabazaar.com` is correctly mapped
   - Check if build completed successfully
   - Ensure SSL certificate is active

### 5. IMMEDIATE TESTING:
After applying fixes, test these endpoints:
- `https://api.bhavyabazaar.com/api/ping` (should return 200)
- `https://api.bhavyabazaar.com/api/auth/ping` (should return CORS headers)
- `https://bhavyabazaar.com` (should load without CORS errors)

### 6. COMMON COOLIFY ISSUES:
- Check if backend service port is correctly set to 8000
- Verify environment variables are saved and applied
- Ensure both services are in "running" state
- Check if domains have valid SSL certificates
- Verify MongoDB and Redis connections are working

## CONTACT SUPPORT:
If issues persist, check Coolify documentation or contact your hosting provider for infrastructure-level debugging.
