# Coolify VPS Deployment Guide - Bhavya Bazaar

## Overview
This guide covers deploying the Bhavya Bazaar React frontend application on your VPS using Coolify panel.

## Current Deployment Status ✅
Your project appears to be well-configured for Coolify deployment with:
- ✅ `Dockerfile.coolify` - Optimized for Coolify
- ✅ `docker-entrypoint.sh` - Dynamic runtime configuration
- ✅ `nginx.conf` - Production-ready nginx configuration
- ✅ Fixed runtime configuration (no browser compatibility issues)

## Coolify Environment Variables

### Required Environment Variables
Set these in your Coolify panel under "Environment Variables":

```bash
# API Configuration
API_URL=https://your-api-domain.com/api/v2
BACKEND_URL=https://your-api-domain.com
SOCKET_URL=wss://your-api-domain.com/ws

# Node Environment
NODE_ENV=production

# Optional: Debugging
DEBUG=false
```

### Example for bhavyabazaar.com:
```bash
API_URL=https://api.bhavyabazaar.com/api/v2
BACKEND_URL=https://api.bhavyabazaar.com
SOCKET_URL=wss://api.bhavyabazaar.com/ws
NODE_ENV=production
```

## Coolify Configuration Steps

### 1. Project Setup in Coolify
1. **Create New Application**
   - Go to your Coolify dashboard
   - Click "New Application" 
   - Choose "Git Repository"

2. **Repository Configuration**
   - Repository URL: Your git repository URL
   - Branch: `main` or your production branch
   - Build Context: `frontend/`

3. **Build Configuration**
   - Dockerfile Path: `Dockerfile.coolify`
   - Build Context: `frontend/` (if frontend is in subdirectory)

### 2. Environment Variables Setup
In Coolify panel, add these environment variables:

```bash
# Core API Configuration
API_URL=https://api.bhavyabazaar.com/api/v2
BACKEND_URL=https://api.bhavyabazaar.com
SOCKET_URL=wss://api.bhavyabazaar.com/ws

# Environment
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false

# Optional Performance
NPM_CONFIG_FUND=false
NPM_CONFIG_AUDIT=false
```

### 3. Domain Configuration
1. **Custom Domain Setup**
   - Add your domain in Coolify (e.g., `bhavyabazaar.com`)
   - Configure SSL certificate (Let's Encrypt)
   - Set up DNS A record pointing to your VPS IP

2. **API Domain Setup**
   - Ensure API subdomain is configured (e.g., `api.bhavyabazaar.com`)
   - Point to your backend service

### 4. Network Configuration
If frontend and backend are separate services in Coolify:

1. **Service Discovery**
   - Use Coolify internal network names
   - Example: `http://backend-service:8000/api/v2`

2. **External Access**
   - Frontend: `https://bhavyabazaar.com`
   - API: `https://api.bhavyabazaar.com`

## Deployment Features

### ✅ Runtime Configuration
- Dynamic environment configuration
- No rebuild required for environment changes
- Browser-compatible (no `process.env` issues)

### ✅ Image Optimization
- All components use proper `getImageUrl()` function
- Consistent image URL handling
- Support for different deployment environments

### ✅ Production Optimizations
- Nginx caching for static assets
- Gzip compression
- Health checks
- Error handling

### ✅ Development vs Production
- Environment-specific configurations
- Automatic API URL detection
- Fallback mechanisms

## Troubleshooting Common Issues

### 1. White Screen Issues ✅ FIXED
- ✅ Runtime config browser-compatible
- ✅ No `process.env` references in browser code
- ✅ Proper fallback configuration

### 2. Image Loading Issues ✅ FIXED
- ✅ All components use `getImageUrl()` function
- ✅ Proper backend URL construction
- ✅ Support for different domain configurations

### 3. API Connection Issues
If API calls fail, check:

```bash
# In Coolify logs, verify environment variables:
echo $API_URL
echo $BACKEND_URL

# Test API connectivity from container:
curl -f "$API_URL/health"
```

### 4. Build Issues
If build fails in Coolify:

```bash
# Clear npm cache
npm cache clean --force

# Install with explicit flags
npm install --no-audit --prefer-offline
```

## Health Monitoring

### Health Check Endpoints
- **Frontend Health**: `https://your-domain.com/health`
- **API Health**: `https://api.your-domain.com/api/v2/health`

### Monitoring in Coolify
1. Check "Logs" tab for build and runtime logs
2. Monitor "Metrics" for resource usage
3. Set up alerts for downtime

## Advanced Configuration

### SSL/TLS
Coolify automatically handles SSL with Let's Encrypt:
```bash
# Automatic SSL renewal
# HTTPS redirect enabled
# HSTS headers configured
```

### Custom Nginx Configuration
If you need to modify nginx settings:

1. Edit `frontend/nginx.conf`
2. Rebuild in Coolify
3. Custom configurations are preserved

### Backup and Recovery
```bash
# Coolify automatically handles:
# - Container restarts
# - Health checks
# - Rolling deployments
# - Backup configurations
```

## Production Checklist

### Pre-Deployment ✅
- ✅ Environment variables configured
- ✅ Domain DNS configured
- ✅ SSL certificates ready
- ✅ Runtime configuration tested

### Post-Deployment Testing
1. **Frontend Access**
   ```bash
   curl -f https://your-domain.com/health
   ```

2. **API Connectivity**
   ```bash
   curl -f https://api.your-domain.com/api/v2/health
   ```

3. **Image Loading**
   - Test user avatars
   - Test product images
   - Test brand logos

4. **Real-time Features**
   - WebSocket connections
   - Chat functionality
   - Notifications

## Maintenance

### Updates
1. Push code changes to repository
2. Coolify automatically triggers rebuild
3. Rolling deployment with zero downtime

### Monitoring
- Check Coolify logs regularly
- Monitor resource usage
- Set up alerting for critical issues

### Backup
- Coolify handles container backups
- Consider database backups for user data
- Document environment variable configurations

## Support

### Logs Access
```bash
# In Coolify:
# 1. Go to your application
# 2. Click "Logs" tab
# 3. View build and runtime logs
```

### Debug Mode
To enable debug mode, add environment variable:
```bash
DEBUG=true
```

### Common Commands
```bash
# Restart application
# Use Coolify "Restart" button

# View logs
# Use Coolify "Logs" tab

# Update configuration
# Modify environment variables in Coolify panel
```

## Security Considerations

### Environment Variables
- Store sensitive data in Coolify environment variables
- Never commit secrets to repository
- Use separate environments for staging/production

### Network Security
- Coolify provides isolated container networks
- SSL/TLS encryption enabled by default
- Rate limiting configured in nginx

### Updates
- Regular security updates through Coolify
- Monitor for vulnerability alerts
- Keep base images updated

---

## Quick Deployment Commands

If you need to redeploy manually:

```bash
# In Coolify panel:
# 1. Go to your application
# 2. Click "Deploy" button
# 3. Monitor build logs
# 4. Test health endpoints
```

Your Bhavya Bazaar application is now ready for production deployment on Coolify! 🚀
