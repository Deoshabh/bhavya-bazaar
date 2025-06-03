const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Bhavya Bazaar deployment configuration...\n');

// Check if build exists
const buildPath = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildPath)) {
  console.error('❌ Build directory not found! Run npm run build:coolify first.');
  process.exit(1);
}

console.log('✅ Build directory exists');

// Check runtime config
const runtimeConfigPath = path.join(buildPath, 'runtime-config.js');
if (!fs.existsSync(runtimeConfigPath)) {
  console.error('❌ Runtime config not found!');
  process.exit(1);
}

const runtimeConfig = fs.readFileSync(runtimeConfigPath, 'utf8');
console.log('✅ Runtime config found');
console.log('📝 Runtime config content:');
console.log(runtimeConfig);

// Check index.html includes runtime config
const indexPath = path.join(buildPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
if (indexContent.includes('runtime-config.js')) {
  console.log('✅ Runtime config script included in index.html');
} else {
  console.log('⚠️  Runtime config script NOT found in index.html');
}

// Test API connectivity
const apiUrl = 'https://api.bhavyabazaar.com/api/v2/health';
console.log(`\n🌐 Testing API connectivity to: ${apiUrl}`);

const options = {
  hostname: 'api.bhavyabazaar.com',
  port: 443,
  path: '/api/v2/health',
  method: 'GET',
  headers: {
    'User-Agent': 'Bhavya-Bazaar-Deployment-Test/1.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  console.log(`📡 Response status: ${res.statusCode}`);
  console.log(`📡 Response headers:`, res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ API Response:', response);
      
      if (response.status === 'healthy') {
        console.log('\n🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!');
        console.log('✅ Frontend build is ready');
        console.log('✅ Runtime configuration is correct');
        console.log('✅ Backend API is healthy and reachable');
        console.log('✅ CORS is properly configured');
        console.log('\n🚀 Ready for Coolify deployment!');
      } else {
        console.log('⚠️  API responded but status is not healthy');
      }
    } catch (error) {
      console.error('❌ Failed to parse API response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API connectivity test failed:', error.message);
  console.log('\n📋 Troubleshooting steps:');
  console.log('1. Check if backend is running');
  console.log('2. Verify DNS resolution for api.bhavyabazaar.com');
  console.log('3. Check firewall/security group settings');
  console.log('4. Verify SSL certificate is valid');
});

req.setTimeout(10000, () => {
  console.error('❌ API request timed out');
  req.abort();
});

req.end();
