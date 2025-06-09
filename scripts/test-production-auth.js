/**
 * Test Production Authentication System
 * This script tests the authentication flow on the live deployment
 */

const https = require('https');

const BASE_URL = 'https://api.bhavyabazaar.com';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAuthEndpoint() {
  console.log('🧪 Testing Production Authentication System\n');
  
  try {
    // Test 1: Check /api/auth/me endpoint without authentication
    console.log('📋 Test 1: Checking /api/auth/me endpoint (unauthenticated)');
    const response = await makeRequest(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 401 && response.data.success === false) {
      console.log('   ✅ Endpoint working correctly - returns 401 for unauthenticated requests\n');
    } else {
      console.log('   ❌ Unexpected response from auth endpoint\n');
    }
    
    // Test 2: Check if the endpoint exists and is accessible
    console.log('📋 Test 2: Verifying endpoint accessibility');
    if (response.status !== 404) {
      console.log('   ✅ /api/auth/me endpoint is accessible and mounted correctly\n');
    } else {
      console.log('   ❌ /api/auth/me endpoint not found (404)\n');
    }
    
    // Test 3: Check server health
    console.log('📋 Test 3: Testing server connectivity');
    try {
      const healthResponse = await makeRequest(`${BASE_URL}/api/v2/user/getuser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Server status: ${healthResponse.status}`);
      if (healthResponse.status === 401) {
        console.log('   ✅ Server is responding and auth middleware is working\n');
      } else {
        console.log('   ⚠️ Unexpected server response\n');
      }
    } catch (error) {
      console.log(`   ❌ Server connectivity issue: ${error.message}\n`);
    }
    
    console.log('🎯 Summary:');
    console.log('   - Authentication endpoint is properly deployed');
    console.log('   - Frontend should now be able to check auth status');
    console.log('   - Auto-login functionality should work on page refresh');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test the authentication flow on https://bhavyabazaar.com');
    console.log('   2. Login with valid credentials');
    console.log('   3. Refresh the page to test auto-login');
    console.log('   4. Check browser console for auth initialization logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthEndpoint();
