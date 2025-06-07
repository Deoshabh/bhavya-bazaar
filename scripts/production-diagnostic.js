#!/usr/bin/env node
/**
 * Production Diagnostic Script for Bhavya Bazaar
 * Tests all critical functionalities and endpoints
 */

const axios = require('axios');
const https = require('https');

// Configuration
const BACKEND_URL = 'https://api.bhavyabazaar.com';
const FRONTEND_URL = 'https://bhavyabazaar.com';

// Create axios instance with proper configuration
const api = axios.create({
  timeout: 10000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates for testing
  })
});

console.log('🔍 BHAVYA BAZAAR PRODUCTION DIAGNOSTIC');
console.log('=====================================\n');

// Test backend endpoints
const testEndpoints = [
  { url: `${BACKEND_URL}/api/v2/health`, name: 'Backend Health' },
  { url: `${BACKEND_URL}/api/v2/debug/env`, name: 'Environment Debug' },
  { url: `${BACKEND_URL}/api/v2/cache/health`, name: 'Redis Health' },
  { url: `${BACKEND_URL}/api/v2/product/get-all-products`, name: 'Products API' },
  { url: `${BACKEND_URL}/api/v2/event/get-all-events`, name: 'Events API' },
  { url: `${BACKEND_URL}/`, name: 'API Root' }
];

async function testEndpoint(endpoint) {
  try {
    const response = await api.get(endpoint.url);
    console.log(`✅ ${endpoint.name}: ${response.status} - ${response.statusText}`);
    if (endpoint.name === 'Environment Debug' && response.data) {
      console.log(`   🔧 Environment Details:`, {
        nodeEnv: response.data.nodeEnv,
        port: response.data.port,
        redisAvailable: response.data.redisAvailable,
        hasDbUri: response.data.hasDbUri
      });
    }
    return true;
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ ${endpoint.name}: ${status} - ${message}`);
    return false;
  }
}

async function testFrontend() {
  try {
    const response = await api.get(FRONTEND_URL);
    console.log(`✅ Frontend: ${response.status} - ${response.statusText}`);
    
    // Check if runtime config is loaded
    if (response.data.includes('runtime-config.js')) {
      console.log(`   📄 Runtime config script found in HTML`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Frontend: ${error.response?.status || 'Network Error'} - ${error.message}`);
    return false;
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS Configuration...');
  try {
    const response = await api.options(`${BACKEND_URL}/api/v2/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log(`✅ CORS Preflight: ${response.status}`);
    console.log(`   Headers:`, response.headers['access-control-allow-origin']);
  } catch (error) {
    console.log(`❌ CORS Test Failed: ${error.message}`);
  }
}

async function testWebSocket() {
  console.log('\n🔌 Testing WebSocket Availability...');
  try {
    // Test WebSocket server status via HTTP upgrade check
    const wsUrl = `${BACKEND_URL}/ws`;
    const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    
    // Try to make a WebSocket handshake request
    const response = await api.get(httpUrl, {
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
        'Sec-WebSocket-Version': '13'
      },
      validateStatus: function (status) {
        // Accept 400, 426, or 101 status codes (WebSocket upgrade responses)
        return status === 101 || status === 400 || status === 426;
      }
    });
    
    if (response.status === 101) {
      console.log(`✅ WebSocket server responding to upgrade requests`);
    } else if (response.status === 400 || response.status === 426) {
      console.log(`✅ WebSocket server available (upgrade required: ${response.status})`);
    } else {
      console.log(`❌ WebSocket unexpected response: ${response.status}`);
    }
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 426)) {
      console.log(`✅ WebSocket server available (upgrade required: ${error.response.status})`);
    } else {
      console.log(`❌ WebSocket test failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Testing Backend Endpoints...\n');
  
  let successCount = 0;
  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }
  
  console.log('\n🌍 Testing Frontend...');
  await testFrontend();
  
  await testCORS();
  await testWebSocket();
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Backend endpoints: ${successCount}/${testEndpoints.length} working`);
  
  if (successCount === testEndpoints.length) {
    console.log('🎉 All backend endpoints are working!');
  } else {
    console.log('⚠️ Some endpoints are failing - check your Coolify deployment');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check Coolify service logs for errors');
  console.log('2. Verify environment variables are set correctly');
  console.log('3. Ensure Redis and MongoDB services are running');
  console.log('4. Check network connectivity between services');
}

main().catch(console.error);
