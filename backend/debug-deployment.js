// Production Debugging Utility for Bhavya Bazaar Backend
// This script helps diagnose deployment issues

const http = require('http');
const https = require('https');

const API_BASE_URL = 'https://api.bhavyabazaar.com';
const FRONTEND_URL = 'https://bhavyabazaar.com';

const testEndpoints = [
  '/api/ping',
  '/api/auth/ping',
  '/api/v2/health',
  '/api/cors-debug',
  '/api/auth/me'
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 10000;
    
    const req = client.get(url, {
      ...options,
      timeout,
      headers: {
        'User-Agent': 'Bhavya-Bazaar-Debug/1.0',
        'Origin': FRONTEND_URL,
        'Accept': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

async function testEndpoint(endpoint) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔍 Testing: ${fullUrl}`);
  
  try {
    const response = await makeRequest(fullUrl);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📋 Headers:`, {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'content-type': response.headers['content-type']
    });
    
    if (response.body) {
      try {
        const parsed = JSON.parse(response.body);
        console.log(`📄 Response:`, parsed);
      } catch (e) {
        console.log(`📄 Response (raw):`, response.body.substring(0, 200));
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function testCorsPreflightRequest() {
  console.log(`\n🔍 Testing CORS Preflight: ${API_BASE_URL}/api/auth/me`);
  
  return new Promise((resolve) => {
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };
    
    const req = https.request(`${API_BASE_URL}/api/auth/me`, options, (res) => {
      console.log(`✅ Preflight Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`, {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      });
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      console.log(`❌ Preflight Error: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

async function runDiagnostics() {
  console.log('🩺 Bhavya Bazaar Backend Deployment Diagnostics');
  console.log('=' .repeat(50));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  const results = [];
  
  // Test basic connectivity
  console.log('\n📡 Testing Basic Connectivity...');
  for (const endpoint of testEndpoints) {
    const success = await testEndpoint(endpoint);
    results.push({ endpoint, success });
  }
  
  // Test CORS preflight
  console.log('\n🌐 Testing CORS Preflight...');
  const corsSuccess = await testCorsPreflightRequest();
  results.push({ endpoint: 'CORS Preflight', success: corsSuccess });
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('=' .repeat(30));
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}`);
  });
  
  console.log(`\n🎯 Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === 0) {
    console.log('\n🚨 CRITICAL: Backend server appears to be completely down!');
    console.log('🔧 Recommended Actions:');
    console.log('   1. Check if the server is running on Coolify');
    console.log('   2. Verify environment variables are set correctly');
    console.log('   3. Check application logs for startup errors');
    console.log('   4. Ensure port 8000 is properly exposed');
  } else if (successCount < totalCount) {
    console.log('\n⚠️  WARNING: Some endpoints are not working properly');
    console.log('🔧 Recommended Actions:');
    console.log('   1. Check CORS configuration in environment variables');
    console.log('   2. Verify database connectivity');
    console.log('   3. Check authentication middleware');
  } else {
    console.log('\n🎉 SUCCESS: All endpoints are working correctly!');
  }
}

// Run diagnostics if this script is executed directly
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics, testEndpoint, testCorsPreflightRequest };
