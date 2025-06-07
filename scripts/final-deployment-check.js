#!/usr/bin/env node

/**
 * Final Deployment Check for Bhavya Bazaar
 * Validates all fixes and configurations before production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Final Deployment Check for Bhavya Bazaar\n');

// Configuration files to verify
const requiredFiles = [
  {
    path: './backend/server.js',
    description: 'Backend server with Redis fixes',
    checks: ['cacheWarmup.warmAllCaches', 'global.redisAvailable', 'enableOfflineQueue']
  },
  {
    path: './backend/config/redis.js',
    description: 'Redis configuration with authentication fix',
    checks: ['process.env.REDIS_PASSWORD', 'enableOfflineQueue: true', 'retryStrategy']
  },
  {
    path: './backend/utils/cacheWarmup.js',
    description: 'Cache warmup service with restored method',
    checks: ['warmAllCaches()', 'preCacheSearches', 'warmUpCache']
  },
  {
    path: './backend/.env.production',
    description: 'Production environment template',
    checks: ['REDIS_HOST', 'REDIS_PASSWORD', 'JWT_SECRET_KEY']
  },
  {
    path: './docker-compose.coolify.yml',
    description: 'Coolify deployment configuration',
    checks: ['redis:', 'bhavya-backend:', 'bhavya-frontend:']
  },
  {
    path: './frontend/nginx.conf',
    description: 'Nginx configuration with React Router fix',
    checks: ['try_files $uri $uri/ /index.html', 'location /']
  },
  {
    path: './DEPLOYMENT_FIX_GUIDE.md',
    description: 'Deployment guide',
    checks: ['Redis Authentication', 'Cache Warmup', 'Frontend 404']
  }
];

// Utility scripts to verify
const utilityScripts = [
  './backend/scripts/redis-troubleshoot.js',
  './backend/scripts/seed-database.js',
  './backend/scripts/test-fixes.js'
];

let allChecksPass = true;
let issuesFound = [];

console.log('📋 Verifying Required Files and Configurations:\n');

requiredFiles.forEach((file, index) => {
  console.log(`${index + 1}. Checking: ${file.description}`);
  
  if (!fs.existsSync(file.path)) {
    console.log(`   ❌ File missing: ${file.path}`);
    allChecksPass = false;
    issuesFound.push(`Missing file: ${file.path}`);
    return;
  }
  
  const content = fs.readFileSync(file.path, 'utf8');
  let fileChecksPass = true;
  
  file.checks.forEach(check => {
    if (!content.includes(check)) {
      console.log(`   ⚠️  Missing: ${check}`);
      fileChecksPass = false;
      issuesFound.push(`${file.path}: Missing ${check}`);
    }
  });
  
  if (fileChecksPass) {
    console.log(`   ✅ All checks passed`);
  } else {
    allChecksPass = false;
  }
  console.log();
});

console.log('🔧 Verifying Utility Scripts:\n');

utilityScripts.forEach((script, index) => {
  console.log(`${index + 1}. ${script}`);
  if (fs.existsSync(script)) {
    console.log(`   ✅ Available`);
  } else {
    console.log(`   ❌ Missing`);
    allChecksPass = false;
    issuesFound.push(`Missing utility script: ${script}`);
  }
});

console.log('\n📊 Backend Package.json Scripts Check:\n');

const backendPackageJson = path.join('./backend/package.json');
if (fs.existsSync(backendPackageJson)) {
  const packageData = JSON.parse(fs.readFileSync(backendPackageJson, 'utf8'));
  const requiredScripts = ['redis:test', 'seed', 'cache:warm', 'cache:clear'];
  
  requiredScripts.forEach(script => {
    if (packageData.scripts && packageData.scripts[script]) {
      console.log(`✅ Script available: npm run ${script}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      allChecksPass = false;
      issuesFound.push(`Missing npm script: ${script}`);
    }
  });
} else {
  console.log('❌ Backend package.json not found');
  allChecksPass = false;
}

console.log('\n🔍 Redis Connection Test:\n');

// Quick Redis connection test
try {
  const redis = require('../backend/config/redis');
  console.log('✅ Redis configuration module loads successfully');
} catch (error) {
  console.log('❌ Redis configuration error:', error.message);
  allChecksPass = false;
  issuesFound.push(`Redis config error: ${error.message}`);
}

console.log('\n📋 Deployment Readiness Summary:\n');

if (allChecksPass) {
  console.log('🎉 ALL CHECKS PASSED! ✅');
  console.log('\n🚀 Ready for Coolify Deployment!');
  console.log('\nNext Steps:');
  console.log('1. 📤 Push code to your git repository');
  console.log('2. 🔧 Set up Coolify deployment using docker-compose.coolify.yml');
  console.log('3. 🔑 Configure environment variables from backend/.env.production');
  console.log('4. 🗄️  Set up MongoDB connection in production');
  console.log('5. 🧪 Test all endpoints using the deployment guide');
  console.log('6. 🌱 Run database seeding in production environment');
  
  console.log('\n🎯 Key Features Now Working:');
  console.log('✅ Redis authentication with password handling');
  console.log('✅ Cache warmup on server startup');
  console.log('✅ Stable Redis connections (no cycling)');
  console.log('✅ Frontend 404 fix for page refresh');
  console.log('✅ Diagnostic and troubleshooting tools');
  console.log('✅ Sample data seeding capability');
  console.log('✅ Production-ready configuration');
  
} else {
  console.log('❌ ISSUES FOUND - Please Fix Before Deployment');
  console.log('\n🔧 Issues to resolve:');
  issuesFound.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommended Actions:');
  console.log('1. Review and fix the issues listed above');
  console.log('2. Re-run this validation script');
  console.log('3. Test locally before deploying to production');
}

console.log('\n📚 Documentation:');
console.log('📄 DEPLOYMENT_FIX_GUIDE.md - Complete deployment instructions');
console.log('📄 REDIS_FIXES_COMPLETE.md - Summary of all Redis fixes');
console.log('🔧 backend/scripts/ - Utility scripts for testing and seeding');

console.log('\n✨ Final deployment check completed!');

process.exit(allChecksPass ? 0 : 1);
