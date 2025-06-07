const fs = require('fs');

console.log('🚀 Quick Deployment Check');
console.log('=========================');

// Check critical files
const criticalFiles = [
  './backend/server.js',
  './backend/config/redis.js', 
  './backend/utils/cacheWarmup.js',
  './docker-compose.coolify.yml',
  './frontend/nginx.conf'
];

let allGood = true;

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n📋 Result:', allGood ? '✅ READY' : '❌ ISSUES FOUND');
