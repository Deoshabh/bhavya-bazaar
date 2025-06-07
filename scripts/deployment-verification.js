#!/usr/bin/env node

/**
 * Deployment Verification Script for Bhavya Bazaar
 * Compares local code with deployed version
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DEPLOYMENT VERIFICATION');
console.log('=========================\n');

// Load axios dynamically
let api;
try {
  const axios = require('axios');
  const BACKEND_URL = 'https://api.bhavyabazaar.com/api/v2';
  
  // Create axios instance with timeout
  api = axios.create({
    timeout: 5000,
    headers: {
      'User-Agent': 'Bhavya-Bazaar-Deployment-Verification/1.0'
    }
  });
  console.log('✅ Axios loaded successfully');
} catch (error) {
  console.log('❌ Error loading axios:', error.message);
  process.exit(1);
}

async function checkLocalVsDeployed() {
  console.log('🔍 DEPLOYMENT VERIFICATION');
  console.log('=========================\n');

  // 1. Check if debug endpoint exists locally and deployed
  console.log('📍 1. Environment Debug Endpoint');
  const localServerJs = fs.readFileSync(path.join(__dirname, '../backend/server.js'), 'utf8');
  const hasDebugEndpointLocal = localServerJs.includes('/api/v2/debug/env');
  console.log(`   Local code has debug endpoint: ${hasDebugEndpointLocal ? '✅' : '❌'}`);
  
  try {
    await api.get(`${BACKEND_URL}/debug/env`);
    console.log('   Deployed version has debug endpoint: ✅');
  } catch (error) {
    console.log('   Deployed version has debug endpoint: ❌');
  }

  // 2. Check Redis health function usage
  console.log('\n📍 2. Redis Health Implementation');
  const hasOldRedisHealthCall = localServerJs.includes('redisHealth.getHealthStatus');
  console.log(`   Local code uses old Redis health function: ${hasOldRedisHealthCall ? '❌' : '✅'}`);
  
  try {
    const response = await api.get(`${BACKEND_URL}/health/redis`);
    console.log('   Deployed Redis health works: ✅');
  } catch (error) {
    const isOldError = error.response?.status === 500 && error.response?.data?.includes('getHealthStatus is not a function');
    console.log(`   Deployed Redis health works: ${isOldError ? '❌ (old code)' : '❌ (other error)'}`);
  }

  // 3. Check WebSocket server setup
  console.log('\n📍 3. WebSocket Server Configuration');
  const hasWebSocketServer = localServerJs.includes('WebSocketServer');
  const hasWebSocketPath = localServerJs.includes('path: "/ws"');
  console.log(`   Local code has WebSocket server: ${hasWebSocketServer ? '✅' : '❌'}`);
  console.log(`   Local code has /ws path: ${hasWebSocketPath ? '✅' : '❌'}`);

  // 4. Check server port configuration
  console.log('\n📍 4. Server Port Configuration');
  const portMatch = localServerJs.match(/const port = process\.env\.PORT \|\| (\d+)/);
  const defaultPort = portMatch ? portMatch[1] : 'unknown';
  console.log(`   Local default port: ${defaultPort}`);

  // 5. Check CORS configuration
  console.log('\n📍 5. CORS Configuration');
  const corsMatch = localServerJs.match(/origin:\s*([^,\n]+)/);
  console.log(`   Local CORS config found: ${corsMatch ? '✅' : '❌'}`);

  // 6. Test specific endpoints that should work
  console.log('\n📍 6. Critical Endpoint Tests');
  
  const endpoints = [
    { name: 'Health Check', url: '/health', expected: 200 },
    { name: 'API Root', url: '/', expected: 200 },
    { name: 'Products', url: '/product/get-all-products', expected: 200 },
    { name: 'Environment Debug', url: '/debug/env', expected: [200, 404] }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(`${BACKEND_URL}${endpoint.url}`);
      const isExpected = Array.isArray(endpoint.expected) 
        ? endpoint.expected.includes(response.status)
        : response.status === endpoint.expected;
      console.log(`   ${endpoint.name}: ${isExpected ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      const status = error.response?.status || 'timeout';
      const isExpected = Array.isArray(endpoint.expected) 
        ? endpoint.expected.includes(status)
        : status === endpoint.expected;
      console.log(`   ${endpoint.name}: ${isExpected ? '✅' : '❌'} (${status})`);
    }
  }

  // 7. Environment variable analysis
  console.log('\n📍 7. Environment Variables Analysis');
  try {
    const envResponse = await api.get(`${BACKEND_URL}/debug/env`);
    const envData = envResponse.data;
    console.log(`   PORT: ${envData.port || 'not set'}`);
    console.log(`   CORS_ORIGIN: ${envData.corsOrigin || 'not set'}`);
    console.log(`   Redis Available: ${envData.redisAvailable ? '✅' : '❌'}`);
    console.log(`   DB Connection: ${envData.hasDbUri ? '✅' : '❌'}`);
    console.log(`   JWT Secret: ${envData.hasJwtSecret ? '✅' : '❌'}`);
  } catch (error) {
    console.log('   ❌ Cannot access environment debug endpoint');
  }

  console.log('\n🔧 RECOMMENDATIONS');
  console.log('==================');
  
  if (!hasDebugEndpointLocal) {
    console.log('❌ Add debug endpoint to local code');
  } else {
    console.log('✅ Debug endpoint exists locally');
  }
  
  if (hasOldRedisHealthCall) {
    console.log('❌ Remove old Redis health function calls');
  } else {
    console.log('✅ Redis health implementation is updated');
  }
  
  if (!hasWebSocketServer) {
    console.log('❌ Add WebSocket server to local code');
  } else {
    console.log('✅ WebSocket server is configured locally');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Ensure all local fixes are committed');
  console.log('2. Deploy the updated code to Coolify');
  console.log('3. Verify environment variables in Coolify panel');
  console.log('4. Check Coolify build and deployment logs');
  console.log('5. Restart the backend service if needed');
}

checkLocalVsDeployed().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});
