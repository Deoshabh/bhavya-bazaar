/**
 * Simple Admin System Test
 * Tests basic admin endpoints using native Node.js https module
 */

const https = require('https');

// Helper function to make HTTPS requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testAdminSystemStatus() {
  console.log('🔍 Testing Admin System Status...');
  
  const options = {
    hostname: 'bhavyabazaar.com',
    port: 443,
    path: '/api/auth/admin/system-status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);
    console.log('✅ Status Code:', result.status);
    console.log('📊 Response:', JSON.stringify(result.data, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testEmergencyAdminSetup() {
  console.log('\n🚨 Testing Emergency Admin Setup...');
  
  const postData = JSON.stringify({
    emergencyKey: "EMERGENCY_ADMIN_BHAVYA_2024"
  });

  const options = {
    hostname: 'bhavyabazaar.com',
    port: 443,
    path: '/api/auth/emergency-admin-setup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const result = await makeRequest(options, postData);
    console.log('✅ Status Code:', result.status);
    console.log('📊 Response:', JSON.stringify(result.data, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  
  const postData = JSON.stringify({
    email: "superadmin@bhavyabazaar.com",
    password: "SuperAdmin@2024!",
    adminSecretKey: "bhavya_admin_secret_2024"
  });

  const options = {
    hostname: 'bhavyabazaar.com',
    port: 443,
    path: '/api/auth/login-admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const result = await makeRequest(options, postData);
    console.log('✅ Status Code:', result.status);
    console.log('📊 Response:', JSON.stringify(result.data, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Simple Admin API Tests\n');
  
  // Test 1: System Status
  await testAdminSystemStatus();
  
  // Test 2: Emergency Setup
  await testEmergencyAdminSetup();
  
  // Test 3: Admin Login
  await testAdminLogin();
  
  console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
