# Coolify Deployment Configuration for Bhavya Bazaar Backend

## Environment Variables Required

Set these in Coolify's environment variables section:

### Core Configuration
```
NODE_ENV=production
PORT=8000
```

### Database
```
DB_URI=mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin
```

### Security
```
JWT_SECRET_KEY=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
SESSION_SECRET=d025bc0cc32caef23fc9c85211b78a6f730edbc321e601422f27f2587eedab17
ACTIVATION_SECRET=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
ADMIN_SECRET_KEY=bhavya_bazaar_admin_2025_secure_key
```

### CORS Configuration
```
CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3000,http://localhost:3004
FRONTEND_URL=https://bhavyabazaar.com
BACKEND_URL=https://api.bhavyabazaar.com
API_URL=https://api.bhavyabazaar.com
```

### Redis Configuration
```
REDIS_HOST=r0sssg8g8wog48ggcgc0s4go
REDIS_PORT=6379
REDIS_PASSWORD=ey66XSWpPTBQuAzKdWRWBD3oHwr5p4iSUie5DRoLoIKgeZM4YZoSufSQEw9Mp3c4
REDIS_DB=0
```

### File Upload
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Security Settings
```
BCRYPT_ROUNDS=12
COOKIE_DOMAIN=.bhavyabazaar.com
```

### Rate Limiting
```
AUTH_RATE_LIMIT_MAX=20
AUTH_RATE_LIMIT_WINDOW=900000
```

### Email Configuration (Optional)
```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@bhavyabazaar.com
```

### Socket Configuration
```
SOCKET_URL=https://api.bhavyabazaar.com
SOKETI_APP_ID=Js3axIJci9Zlwl88
SOKETI_APP_KEY=TzBt
SOKETI_CLUSTER=mt1
SOKETI_HOST=soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io
SOKETI_PATH=/ws
SOKETI_PORT=443
```

## Deployment Steps

1. **Create New Application in Coolify**
   - Choose "Git Repository" as source
   - Connect your GitHub repository
   - Set branch to `main` or your deployment branch

2. **Configure Build Settings**
   - Build Command: `npm install --production`
   - Start Command: `npm run start`
   - Port: `8000`

3. **Set Environment Variables**
   - Copy all variables from above into Coolify's environment section
   - Ensure all required variables are properly set

4. **Configure Domains**
   - Set custom domain to: `api.bhavyabazaar.com`
   - Enable SSL/TLS certificate
   - Enable HTTP to HTTPS redirect

5. **Health Check Configuration**
   - Health Check URL: `/api/ping`
   - Health Check Interval: 30 seconds
   - Health Check Timeout: 10 seconds

6. **Resource Limits**
   - Memory: 512MB minimum (1GB recommended)
   - CPU: 0.5 cores minimum

## Troubleshooting

### 502 Bad Gateway
- Check if the application is running on port 8000
- Verify environment variables are set correctly
- Check application logs for startup errors

### CORS Errors
- Ensure `CORS_ORIGIN` includes your frontend domain
- Verify frontend is making requests to correct API URL
- Check browser network tab for preflight OPTIONS requests

### Database Connection Issues
- Verify `DB_URI` is correct and accessible
- Check MongoDB server status
- Ensure network connectivity between Coolify and MongoDB

### Redis Connection Issues
- Verify Redis credentials and host
- Check if Redis server is accessible
- Application will fall back to memory storage if Redis fails

## Monitoring

### Important Endpoints to Monitor
- `GET /api/ping` - Basic health check
- `GET /api/auth/ping` - Auth service health
- `GET /api/v2/health` - Detailed health status
- `GET /api/cors-debug` - CORS configuration debug

### Log Monitoring
- Monitor application startup logs
- Check for MongoDB connection success
- Watch for Redis connection status
- Monitor CORS request logs

## Scaling

### Horizontal Scaling
- Backend is stateless (sessions in Redis)
- Can run multiple instances behind load balancer
- Ensure Redis is shared between instances

### Performance Optimization
- Enable database connection pooling
- Use Redis for session storage and caching
- Monitor memory usage and optimize as needed
