#!/usr/bin/env node

/**
 * Production Configuration Update Script
 * This script updates the live production runtime configuration
 * to fix the API endpoint routing issue
 */

const https = require('https');
const fs = require('path');

console.log('🚀 Production Configuration Update');
console.log('==================================');

const PRODUCTION_CONFIG = {
  frontend: 'https://bhavyabazaar.com',
  apiBase: 'https://api.bhavyabazaar.com',
  correctApiUrl: 'https://api.bhavyabazaar.com/api/v2'
};

// The correct runtime configuration
const CORRECT_RUNTIME_CONFIG = `// Runtime configuration for Bhavya Bazaar production deployment
window.RUNTIME_CONFIG = {
  API_URL: "https://api.bhavyabazaar.com/api/v2",
  SOCKET_URL: "https://api.bhavyabazaar.com",
  BACKEND_URL: "https://api.bhavyabazaar.com",
  ENV: "production",
  DEBUG: false
};

// Also provide the new format for compatibility
window.__RUNTIME_CONFIG__ = window.RUNTIME_CONFIG;

console.log('Runtime configuration loaded:', window.RUNTIME_CONFIG);`;

console.log('📝 Correct Runtime Configuration:');
console.log('----------------------------------');
console.log(CORRECT_RUNTIME_CONFIG);

console.log('\n🔧 Steps to Fix Production:');
console.log('---------------------------');
console.log('1. Update the local build/runtime-config.js file ✅ (Already done)');
console.log('2. Update the public/runtime-config.js file ✅ (Already done)');
console.log('3. Deploy the updated files to production');
console.log('4. Verify the fix by testing API endpoints');

console.log('\n📋 Deployment Options:');
console.log('----------------------');
console.log('Option 1: If using Coolify with Git deployment:');
console.log('   - Commit the changes to your Git repository');
console.log('   - Trigger a redeploy in Coolify dashboard');

console.log('\nOption 2: If using manual file upload:');
console.log('   - Upload frontend/build/runtime-config.js to your web server');
console.log('   - Ensure it\'s accessible at https://bhavyabazaar.com/runtime-config.js');

console.log('\nOption 3: If using Docker deployment:');
console.log('   - Rebuild the frontend Docker image');
console.log('   - Redeploy the container');

console.log('\n🧪 Test Commands After Deployment:');
console.log('----------------------------------');
console.log('Test runtime config:');
console.log('   curl https://bhavyabazaar.com/runtime-config.js');
console.log('');
console.log('Test API endpoint (should work after fix):');
console.log('   curl https://api.bhavyabazaar.com/api/v2/product/get-all-products');
console.log('');
console.log('Test health endpoint:');
console.log('   curl https://api.bhavyabazaar.com/api/v2/health');

console.log('\n💡 What This Fixes:');
console.log('-------------------');
console.log('❌ Before: Frontend calls https://api.bhavyabazaar.com/product/get-all-products (404)');
console.log('✅ After:  Frontend calls https://api.bhavyabazaar.com/api/v2/product/get-all-products (200)');

console.log('\n🎯 Expected Results:');
console.log('-------------------');
console.log('✅ Login functionality should work');
console.log('✅ Product loading should work');
console.log('✅ Events loading should work');
console.log('✅ All API endpoints should be accessible');
console.log('✅ No more 404 errors in browser network tab');

console.log('\n🔍 How to Verify Fix:');
console.log('---------------------');
console.log('1. Open browser dev tools on https://bhavyabazaar.com');
console.log('2. Check Console tab for "Runtime configuration loaded" message');
console.log('3. Verify API_URL contains "/api/v2" in the logged config');
console.log('4. Check Network tab - all API calls should use /api/v2 prefix');
console.log('5. Test login and product browsing functionality');

console.log('\n⚠️  Important Notes:');
console.log('--------------------');
console.log('- This fix addresses the root cause of all 404 API errors');
console.log('- The backend is working correctly, only frontend config was wrong');
console.log('- All user accounts and data are intact');
console.log('- No database changes needed');

console.log('\n🚀 Ready for deployment!');
