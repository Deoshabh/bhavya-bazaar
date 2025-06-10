# Bhavya Bazaar Frontend Deployment Guide

## 🚀 Production Deployment Steps

### Prerequisites
- Production build is ready in `/build` directory
- All session-based authentication updates have been applied
- WebSocket URLs have been corrected for session-based auth

### 1. Deploy Production Build
Replace the current development build on your web server with the contents of the `/build` directory:

```bash
# Copy build contents to web server
# Example for typical deployments:
rsync -av build/ your-server:/var/www/bhavyabazaar/
# OR
scp -r build/* user@server:/path/to/webroot/
```

### 2. Verify Deployment
After deployment, check:

1. **JavaScript Bundle**: Ensure production bundles are loaded (not development versions)
2. **Session Authentication**: Test login → logout → login cycle with session-based auth
3. **API Connections**: Verify all API endpoints respond correctly
4. **Messaging System**: Check HTTP-based messaging functionality

### 3. Test Session Authentication Flow
1. Clear browser cache and cookies
2. Navigate to login page
3. Login with valid credentials
4. Verify successful session-based authentication
5. Refresh page - session should persist
6. Logout completely - session should be destroyed
7. Try logging in again - should work without infinite refresh

### 4. Monitor Console
Check browser console for:
- ✅ No development mode warnings
- ✅ Successful API connections
- ✅ HTTP-based messaging system working 
- ✅ Session-based authentication working (no JWT tokens in localStorage)
- ✅ No 401 authentication errors after successful login

## 🔧 Configuration Details

### Runtime Configuration
The build includes `runtime-config.js` with production settings:
- API URL: `https://api.bhavyabazaar.com/api/v2`
- Unified Auth: `https://api.bhavyabazaar.com/api/auth`
- Environment: `production`

### Key Files Modified for Session-Based Authentication
- **Backend Controllers**: `auth.js`, `user.js`, `shop.js` - Converted to session-based authentication
- **Backend Middleware**: `auth.js` - Updated to use SessionManager
- **Frontend Auth Utils**: `auth.js` - Migrated from JWT to session-based checks
- **Frontend Redux**: `user.js` actions - Updated to use unified auth endpoints
- **Frontend Components**: Login forms, route guards - Updated for session authentication
- **Messaging System**: HTTP-based messaging system

## 🐛 Troubleshooting

### If Session Authentication Loops:
1. Check browser network tab for 401 errors
2. Verify session cookies are being set correctly
3. Clear all browser data and try again
4. Check backend SessionManager configuration

### If Messaging System Issues:
1. Verify HTTP messaging endpoints are accessible
2. Check session authentication for message API calls
3. Ensure proper error handling in message components
4. Check browser console for messaging-related errors

### If Session Persistence Issues:
1. Check session configuration in `backend/config/session.js`
2. Verify Redis connection for session storage
3. Check session cookie domain and security settings
4. Ensure backend and frontend are on same domain for session sharing

### If API Errors Persist:
1. Check session cookies are being sent in requests (`withCredentials: true`)
2. Verify CORS configuration allows credentials
3. Check SessionManager validation in backend middleware

## ✅ Success Indicators
- Login works on first attempt with session creation
- Session persists across page refreshes
- Logout → Login cycle works smoothly with session cleanup
- No infinite refresh loops
- HTTP-based messaging system working properly
- Console shows production bundle loads
- No JWT tokens in localStorage (session-based auth only)
