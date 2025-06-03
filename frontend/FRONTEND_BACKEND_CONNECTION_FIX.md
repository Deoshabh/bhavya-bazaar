# Frontend-Backend Connection Fix for Coolify Deployment

## What Was Fixed

### 1. Dynamic API URL Configuration
- Updated `src/server.js` to support runtime configuration
- Added smart domain detection for Coolify deployments
- Environment variables now properly override defaults

### 2. Runtime Configuration System
- Created `public/runtime-config.js` for deployment-time configuration
- Added detection patterns for common Coolify domain structures
- Supports both build-time and runtime environment variables

### 3. Deployment Scripts
- `scripts/configure-coolify.js` - Node.js configuration script
- `scripts/configure-coolify-ps.ps1` - PowerShell configuration script
- `scripts/test-api-connection.js` - API connectivity test

### 4. Updated Environment Configuration
- Modified `.env.production` to be more flexible
- Added support for runtime environment variable overrides

## How to Deploy on Coolify

### Backend Deployment
1. Create a new service in Coolify
2. Set environment variables (see deployment guide)
3. Deploy and note the backend URL (e.g., `https://api.yourdomain.com`)

### Frontend Deployment
1. Create a static site service in Coolify
2. Set these environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api/v2
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   REACT_APP_SOCKET_URL=https://your-backend-url.com
   ```
3. Use build command: `npm run build:coolify`
4. Publish directory: `build`

### Alternative Runtime Configuration
If environment variables don't work during build, use post-build hooks:

```bash
# After build, before serving
API_URL=https://your-backend-url.com/api/v2 node scripts/configure-coolify.js
```

## Testing the Connection

```bash
# Test API connectivity
REACT_APP_API_URL=https://your-backend-url.com/api/v2 node scripts/test-api-connection.js
```

## Files Modified

- `src/server.js` - Dynamic API URL configuration
- `src/api.js` - Improved HTTPS handling
- `public/runtime-config.js` - Runtime configuration
- `public/index.html` - Runtime config script inclusion
- `.env.production` - Flexible environment variables
- `package.json` - Added deployment scripts

## Key Features

1. **Smart Domain Detection**: Automatically detects backend URL based on frontend domain
2. **Runtime Configuration**: Can override API URLs after build
3. **Fallback Support**: Multiple fallback strategies for failed connections
4. **Environment Flexibility**: Works with both build-time and runtime variables
5. **Coolify Optimized**: Designed specifically for Coolify deployment patterns

## Troubleshooting

1. **Check environment variables** in Coolify dashboard
2. **Verify CORS settings** in backend for your frontend domain
3. **Test API health endpoint** directly: `https://your-backend-url.com/api/v2/health`
4. **Check browser console** for connection errors
5. **Use network tab** to verify API call destinations

The frontend should now properly connect to your backend when deployed on Coolify!
