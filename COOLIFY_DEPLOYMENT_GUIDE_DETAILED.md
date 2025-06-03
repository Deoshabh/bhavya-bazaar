# Coolify Deployment Guide

This guide will help you deploy both the frontend and backend of Bhavya Bazaar on Coolify and ensure they connect properly.

## Prerequisites

1. Coolify instance running
2. Domain names or subdomains configured
3. Both frontend and backend code pushed to Git repositories

## Backend Deployment

### 1. Create Backend Service in Coolify

1. **Add New Service** → **Docker Compose** or **Simple Dockerfile**
2. **Repository**: Your backend repository URL
3. **Branch**: `main` or your production branch
4. **Build Command**: `npm install && npm run build` (if you have a build step)
5. **Start Command**: `npm start` or `node server.js`
6. **Port**: `8005` (or whatever port your backend uses)

### 2. Environment Variables for Backend

Set these in Coolify's environment variables section:

```bash
NODE_ENV=production
PORT=8005
DB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
ACTIVATION_SECRET=your_activation_secret
SMPT_HOST=your_smtp_host
SMPT_PORT=587
SMPT_PASSWORD=your_smtp_password
SMPT_MAIL=your_smtp_email
STRIPE_API_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

### 3. Backend Domain Configuration

- **Domain**: `api.yourdomain.com` or `backend-app.yourdomain.com`
- **HTTPS**: Enable automatic HTTPS
- **Health Check**: `/api/v2/health`

## Frontend Deployment

### 1. Create Frontend Service in Coolify

1. **Add New Service** → **Static Site**
2. **Repository**: Your frontend repository URL
3. **Branch**: `main` or your production branch
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `build`

### 2. Environment Variables for Frontend

Set these in Coolify's environment variables section (replace with your actual backend URL):

```bash
NODE_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com/api/v2
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
REACT_APP_API_TIMEOUT=15000
```

### 3. Frontend Domain Configuration

- **Domain**: `yourdomain.com` or `app.yourdomain.com`
- **HTTPS**: Enable automatic HTTPS

## Post-Deployment Configuration

### 1. Update Backend CORS

Make sure your backend allows requests from your frontend domain. In your backend `server.js`, the `allowedOrigins` array should include:

```javascript
const allowedOrigins = [
  "https://yourdomain.com",           // Your frontend domain
  "https://app.yourdomain.com",       // Alternative frontend domain
  "https://api.yourdomain.com",       // Your backend domain
  "http://localhost:3000",            // For local development
];
```

### 2. Test the Connection

1. **Backend Health Check**: Visit `https://api.yourdomain.com/api/v2/health`
2. **Frontend**: Visit your frontend domain
3. **Check Browser Console**: Look for any API connection errors
4. **Network Tab**: Verify API calls are going to the correct backend URL

### 3. Troubleshooting

If the frontend can't connect to the backend:

1. **Check Environment Variables**: Ensure `REACT_APP_API_URL` is set correctly
2. **Check CORS**: Verify backend allows your frontend domain
3. **Check SSL**: Ensure both services use HTTPS
4. **Check Logs**: Review Coolify logs for both services

### 4. Alternative: Manual Runtime Configuration

If environment variables don't work as expected, you can manually update the runtime configuration after build:

1. **Add Build Hook** in Coolify (after successful build):
   ```bash
   API_URL=https://api.yourdomain.com/api/v2 node scripts/configure-coolify.js
   ```

2. **Or use PowerShell** (if using Windows runner):
   ```powershell
   $env:API_URL="https://api.yourdomain.com/api/v2"; .\scripts\configure-coolify-ps.ps1
   ```

## Example Deployment Workflow

1. **Deploy Backend First**
   - Set up backend service in Coolify
   - Configure environment variables
   - Deploy and verify health check works

2. **Get Backend URL**
   - Note the backend URL (e.g., `https://api.yourdomain.com`)

3. **Deploy Frontend**
   - Set `REACT_APP_API_URL=https://api.yourdomain.com/api/v2`
   - Set other environment variables
   - Deploy frontend

4. **Verify Connection**
   - Test frontend functionality
   - Check browser console for errors
   - Verify API calls in Network tab

## Common Issues and Solutions

### Issue: Frontend shows "Network Error"
**Solution**: Check if `REACT_APP_API_URL` points to the correct backend URL

### Issue: CORS errors
**Solution**: Add your frontend domain to the backend's `allowedOrigins` array

### Issue: SSL certificate errors
**Solution**: Ensure both frontend and backend use HTTPS, or configure HTTP fallback

### Issue: API calls to localhost
**Solution**: Verify environment variables are set correctly during build

## Support

If you encounter issues:
1. Check Coolify logs for both services
2. Verify environment variables are set correctly
3. Test backend health endpoint directly
4. Check browser console and network tab for frontend issues
