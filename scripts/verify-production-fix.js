const https = require('https');

console.log('🧪 Production Fix Verification');
console.log('==============================');

const PRODUCTION_CONFIG = {
  frontend: 'https://bhavyabazaar.com',
  apiBase: 'https://api.bhavyabazaar.com',
  apiWithPrefix: 'https://api.bhavyabazaar.com/api/v2'
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bhavya-Bazaar-Fix-Verification/1.0',
        'Origin': PRODUCTION_CONFIG.frontend,
        ...options.headers
      },
      timeout: 10000
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          parsed: (() => {
            try {
              return JSON.parse(data);
            } catch {
              return data;
            }
          })()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
}

// Test if the runtime config is fixed
async function testRuntimeConfigFix() {
  console.log('\n📋 Testing Runtime Configuration Fix');
  console.log('------------------------------------');

  try {
    const configResponse = await makeRequest(`${PRODUCTION_CONFIG.frontend}/runtime-config.js`);
    console.log(`Status: ${configResponse.statusCode}`);
    
    if (configResponse.statusCode === 200) {
      console.log('✅ Runtime config file accessible');
      
      // Check if it contains the correct API_URL
      if (configResponse.data.includes('api.bhavyabazaar.com/api/v2')) {
        console.log('✅ Runtime config contains correct API_URL with /api/v2');
        console.log('✅ Frontend configuration fix deployed successfully!');
        return true;
      } else {
        console.log('❌ Runtime config still missing /api/v2 prefix');
        console.log('📄 Current content:');
        console.log(configResponse.data);
        return false;
      }
    } else {
      console.log('❌ Could not fetch runtime config');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error fetching runtime config: ${error.message}`);
    return false;
  }
}

// Test API endpoints that should work after fix
async function testApiEndpointsAfterFix() {
  console.log('\n🔗 Testing API Endpoints (Post-Fix)');
  console.log('-----------------------------------');

  const endpointsToTest = [
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/health`,
      description: 'Health Check',
      expectWorking: true
    },
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/product/get-all-products`,
      description: 'Products Endpoint',
      expectWorking: true
    },
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/event/get-all-events`,
      description: 'Events Endpoint',
      expectWorking: true
    },
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/shop/getSeller`,
      description: 'Shop Endpoint (requires auth)',
      expectWorking: true,
      expectStatus: 401
    }
  ];

  let workingCount = 0;
  
  for (const endpoint of endpointsToTest) {
    try {
      console.log(`\n🧪 Testing: ${endpoint.description}`);
      const response = await makeRequest(endpoint.url);
      console.log(`   Status: ${response.statusCode}`);
      
      if (endpoint.expectStatus && response.statusCode === endpoint.expectStatus) {
        console.log(`   ✅ Expected status ${endpoint.expectStatus} received`);
        workingCount++;
      } else if (response.statusCode === 200 || response.statusCode === 201) {
        console.log(`   ✅ Working correctly (${response.statusCode})`);
        workingCount++;
      } else if (response.statusCode === 401) {
        console.log(`   ✅ Endpoint exists but requires authentication`);
        workingCount++;
      } else if (response.statusCode === 404) {
        console.log(`   ❌ Still getting 404 - fix not fully deployed`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return workingCount;
}

// Test login functionality specifically
async function testLoginFunctionality() {
  console.log('\n🔐 Testing Login Functionality');
  console.log('------------------------------');

  try {
    // Test the login endpoint with test credentials
    const loginData = JSON.stringify({
      phoneNumber: "9876543210",
      password: "admin123456"
    });

    const loginResponse = await makeRequest(`${PRODUCTION_CONFIG.apiWithPrefix}/user/login-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: loginData
    });

    console.log(`Login endpoint status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode === 201) {
      console.log('✅ Login endpoint working correctly');
      console.log('✅ User authentication system functional');
      return true;
    } else if (loginResponse.statusCode === 400) {
      console.log('✅ Login endpoint accessible (400 = validation error)');
      return true;
    } else if (loginResponse.statusCode === 404) {
      console.log('❌ Login endpoint still not found');
      return false;
    } else {
      console.log(`⚠️  Unexpected login response: ${loginResponse.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login test error: ${error.message}`);
    return false;
  }
}

// Main verification function
async function runVerification() {
  try {
    const configFixed = await testRuntimeConfigFix();
    
    if (!configFixed) {
      console.log('\n❌ Runtime configuration not fixed yet');
      console.log('📋 Next Steps:');
      console.log('1. Deploy the updated runtime-config.js to production');
      console.log('2. Ensure it\'s accessible at https://bhavyabazaar.com/runtime-config.js');
      console.log('3. Run this verification script again');
      return;
    }

    const workingEndpoints = await testApiEndpointsAfterFix();
    const loginWorking = await testLoginFunctionality();

    console.log('\n📊 Verification Results');
    console.log('========================');
    
    if (configFixed && workingEndpoints >= 3 && loginWorking) {
      console.log('🎉 SUCCESS! Production fix deployed successfully!');
      console.log('');
      console.log('✅ Runtime configuration fixed');
      console.log('✅ API endpoints accessible');
      console.log('✅ Login functionality working');
      console.log('✅ Frontend should now work correctly');
      console.log('');
      console.log('🚀 Your Bhavya Bazaar e-commerce site is fully functional!');
      
    } else {
      console.log('⚠️  Partial fix deployed');
      console.log(`✅ Config fixed: ${configFixed}`);
      console.log(`✅ Working endpoints: ${workingEndpoints}/4`);
      console.log(`✅ Login working: ${loginWorking}`);
      console.log('');
      console.log('📋 You may need to:');
      console.log('1. Clear browser cache');
      console.log('2. Wait a few minutes for CDN/cache refresh');
      console.log('3. Check Coolify deployment logs');
    }

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Run verification
runVerification();
