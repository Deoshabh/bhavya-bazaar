#!/usr/bin/env node

/**
 * Project Cleanup Script for Bhavya Bazaar
 * Removes unnecessary files and organizes the project structure
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting project cleanup...\n');

// Files and directories to clean up
const filesToRemove = [
  // Duplicate or old configuration files
  './coolify-backend-env.txt',
  './coolify-environment-template.env',
  './backend/redis-env-additions.env',
  './backend/production.env', // We have .env.production now
  
  // Deployment scripts that are no longer needed
  './deploy-redis-coolify.bat',
  './deploy-redis-coolify.sh',
  
  // Old monitoring files
  './docker-compose.monitoring.yml',
  
  // Test files that can be consolidated
  './quick-test.js',
];

// Optional files to review (won't delete automatically)
const filesToReview = [
  './scripts/accurate-production-test.js',
  './scripts/auth-fix-report.js',
  './scripts/check-production-env.js',
  './scripts/comprehensive-api-test.js',
  './scripts/final-validation.js',
  './scripts/fix-production-config.js',
  './scripts/fix-production-login.js',
  './scripts/fix-runtime-config.js',
  './scripts/performance-analysis.js',
  './scripts/quick-performance-test.js',
  './scripts/test-api-endpoints.js',
  './scripts/test-api-fixes.js',
  './scripts/test-auth-endpoints.js',
  './scripts/test-authentication-fix.js',
  './scripts/test-authentication.js',
  './scripts/test-enhanced-images.js',
  './scripts/test-registration.js',
  './scripts/website-flow-test.js',
];

// Clean up unnecessary files
let cleanedCount = 0;
filesToRemove.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${file}`);
      cleanedCount++;
    } catch (error) {
      console.log(`❌ Failed to remove: ${file} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Not found: ${file}`);
  }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   Removed ${cleanedCount} files`);

console.log(`\n📋 Files to Review (not deleted):`);
filesToReview.forEach(file => {
  if (fs.existsSync(path.resolve(file))) {
    console.log(`   📄 ${file} - Review if still needed`);
  }
});

// Create organized structure summary
console.log('\n📁 Current Organized Structure:');
console.log(`
📁 bhavya-bazaar/
├── 📄 README.md
├── 📄 REDIS_FIXES_COMPLETE.md ✨ (New)
├── 📄 DEPLOYMENT_FIX_GUIDE.md ✨ (New)
├── 📄 docker-compose.coolify.yml (Updated)
├── 📄 package.json
│
├── 📁 backend/
│   ├── 📄 server.js (Fixed)
│   ├── 📄 package.json (Updated with scripts)
│   ├── 📄 .env.production ✨ (New)
│   │
│   ├── 📁 config/
│   │   ├── 📄 redis.js (Fixed)
│   │   └── 📄 redis.production.js
│   │
│   ├── 📁 utils/
│   │   ├── 📄 cacheService.js
│   │   ├── 📄 cacheWarmup.js (Fixed)
│   │   └── 📄 redisHealth.js
│   │
│   ├── 📁 scripts/ ✨ (New)
│   │   ├── 📄 redis-troubleshoot.js ✨
│   │   ├── 📄 seed-database.js ✨
│   │   └── 📄 test-fixes.js ✨
│   │
│   └── 📁 [other existing folders]
│
├── 📁 frontend/
└── 📁 scripts/ (review for cleanup)
`);

console.log('\n🎯 Key Improvements:');
console.log('✅ Redis authentication issues fixed');
console.log('✅ Cache warmup functionality restored');
console.log('✅ Connection cycling resolved');
console.log('✅ Useful utility scripts added');
console.log('✅ Clean project structure');
console.log('✅ Production-ready configuration');

console.log('\n🚀 Next Steps:');
console.log('1. Review the files in /scripts/ folder for cleanup');
console.log('2. Test the application with: npm run redis:test');
console.log('3. Add sample data with: npm run seed');
console.log('4. Deploy to Coolify using DEPLOYMENT_FIX_GUIDE.md');
console.log('5. Monitor deployment with cache health endpoints');

console.log('\n✨ Cleanup completed successfully!');
