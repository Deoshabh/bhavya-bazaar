# Bhavya Bazaar Production Fix Deployment Guide

## Issue Identified
The frontend was configured to call API endpoints without the `/api/v2` prefix, causing 404 errors. The live production `runtime-config.js` had:
```js
API_URL: "https://api.bhavyabazaar.com"  // ❌ Missing /api/v2
```

## Fix Applied
Updated the runtime configuration to include the correct API prefix:
```js
API_URL: "https://api.bhavyabazaar.com/api/v2"  // ✅ Correct
```

## Files Modified
- ✅ `frontend/public/runtime-config.js` - Fixed API_URL with /api/v2 prefix
- ✅ `frontend/build/runtime-config.js` - Fixed API_URL with /api/v2 prefix

## Quick Deployment Commands

### Option 1: Git + Coolify (Recommended)
```powershell
# Navigate to project directory
cd d:\Projects\bhavya-bazaar

# Stage the changes
git add frontend/public/runtime-config.js
git add frontend/build/runtime-config.js

# Commit the fix
git commit -m "Fix: Update runtime config with correct API_URL prefix (/api/v2)

- Frontend was calling https://api.bhavyabazaar.com/product/* (404)
- Now calls https://api.bhavyabazaar.com/api/v2/product/* (200)
- Fixes all API endpoint routing issues
- Resolves login and product loading problems"

# Push to your repository
git push origin main

# Then trigger redeploy in Coolify dashboard
```

### Option 2: Manual Build & Deploy
```powershell
cd d:\Projects\bhavya-bazaar\frontend

# Rebuild the frontend
npm run build

# The updated runtime-config.js is now in the build directory
# Upload the build directory contents to your web server
```

## Verification Commands

### Test the fix immediately:
```powershell
# Run the verification script
cd d:\Projects\bhavya-bazaar
node scripts/verify-production-fix.js
```

### Manual verification:
```powershell
# Test runtime config
curl https://bhavyabazaar.com/runtime-config.js

# Test API endpoint (should return data, not 404)
curl https://api.bhavyabazaar.com/api/v2/product/get-all-products
```

## Expected Results After Fix

### Before Fix (Current State):
- ❌ Login fails with 404 errors
- ❌ Products don't load (404 errors) 
- ❌ Events don't load (404 errors)
- ❌ Frontend console shows API errors

### After Fix:
- ✅ Login works correctly
- ✅ Products load and display
- ✅ Events load and display  
- ✅ All API calls use correct `/api/v2` prefix
- ✅ No more 404 errors in browser network tab

## Troubleshooting

If the fix doesn't work immediately:
1. **Clear browser cache** - Hard refresh (Ctrl+F5)
2. **Wait 2-3 minutes** - CDN/proxy cache may need to refresh
3. **Check deployment logs** - Verify files were uploaded correctly
4. **Run verification script** - `node scripts/verify-production-fix.js`

## Test User Account
After fix is deployed, you can test login with:
- **Phone**: 9876543210  
- **Password**: admin123456

---

**This fix resolves the root cause of all API routing issues. Your e-commerce site should be fully functional after deployment!** 🚀
