# 🚀 Coolify Production Scripts Guide

This guide shows how to run authentication tests and seller cleanup scripts directly on your Coolify deployment.

## 📋 Available Commands

### 🧪 Authentication Testing

Test all authentication endpoints in production:

```bash
# Basic authentication test
npm run test:auth

# Full production test with explicit URL
npm run test:auth-prod
```

### 🔧 Seller Cleanup & Diagnosis

#### Diagnose Issues
Check if a phone number is blocked by a problematic seller:

```bash
# Check specific phone number
npm run cleanup:diagnose 9876543210

# Or with full command
npm run cleanup:sellers diagnose 9876543210
```

#### Fix Seller Issues
Safely remove sellers that are blocking phone numbers:

```bash
# Safe cleanup (won't delete sellers with data)
npm run cleanup:fix 9876543210

# Force cleanup (deletes everything - USE WITH CAUTION)
npm run cleanup:sellers force 9876543210
```

#### List All Sellers
See all sellers in the database:

```bash
npm run cleanup:sellers list
```

## 🎯 How to Run on Coolify

### Method 1: Coolify Web Terminal

1. Go to your Coolify dashboard
2. Navigate to your backend service
3. Click "Terminal" or "Exec" button
4. Run any of the commands above

### Method 2: Coolify SSH

1. SSH into your Coolify server
2. Navigate to your app container:
   ```bash
   docker exec -it <your-backend-container> /bin/bash
   ```
3. Run the commands inside the container

### Method 3: Coolify Build Hook

Add these as build hooks or deployment scripts in your Coolify configuration.

## 🔍 Common Use Cases

### Scenario 1: User Can't Register as Seller
**Problem:** "Phone number already exists" error

**Solution:**
```bash
# First, diagnose the issue
npm run cleanup:diagnose 9876543210

# If seller exists but is problematic, fix it
npm run cleanup:fix 9876543210
```

### Scenario 2: Deleted Seller Still Exists
**Problem:** Admin deleted seller but they still appear in database

**Solution:**
```bash
# Force delete the seller and all data
npm run cleanup:sellers force 9876543210
```

### Scenario 3: Authentication System Issues
**Problem:** Login/registration not working properly

**Solution:**
```bash
# Test all authentication endpoints
npm run test:auth
```

## 📊 Script Output Examples

### Authentication Test Success:
```
🚀 STARTING PRODUCTION AUTHENTICATION TESTS
✅ SUCCESS - Status: 200 (150ms)
📝 User Registration Test
✅ SUCCESS - Status: 201 (300ms)
🎉 All critical authentication flows working properly!
```

### Seller Diagnosis:
```
🔍 PRODUCTION SELLER DIAGNOSIS
❌ Seller exists and blocks phone number:
   Name: Test Shop
   ID: 64abc123def456789
   Products: 0
   Events: 0
   Coupons: 0
🔬 Diagnosis: Seller is empty - safe to delete
```

### Successful Cleanup:
```
🧹 Starting production cleanup...
✅ Seller "Test Shop" completely removed from production database
🎯 Phone number is now available for new registration
```

## ⚠️ Important Notes

1. **Always diagnose first** before running cleanup
2. **Use force delete carefully** - it permanently removes all seller data
3. **Test authentication** after any cleanup to verify fixes
4. **Check Coolify logs** if scripts fail to run
5. **Backup important data** before force deletions

## 🆘 Troubleshooting

### Script Won't Run
- Check if you're in the correct directory (`/backend`)
- Verify Node.js dependencies are installed
- Check environment variables are set

### Database Connection Issues
- Verify `MONGODB_URI` environment variable
- Check database credentials in Coolify
- Ensure database is accessible from your deployment

### Permission Errors
- Run with proper container permissions
- Check if scripts have execute permissions

## 📞 Emergency Quick Fix

If you need to immediately fix a blocked phone number:

```bash
# One-liner to force delete seller and test auth
npm run cleanup:sellers force 9876543210 && npm run test:auth
```

This will remove the problematic seller and verify authentication is working.

---

✨ **All scripts are production-ready and safe to run on Coolify!**
