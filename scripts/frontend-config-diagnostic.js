const https = require('https');
const http = require('http');

console.log('🔧 Frontend Configuration Diagnostic Tool');
console.log('==========================================');

const PRODUCTION_CONFIG = {
  frontend: 'https://bhavyabazaar.com',
  apiBase: 'https://api.bhavyabazaar.com',
  apiWithPrefix: 'https://api.bhavyabazaar.com/api/v2'
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestModule = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bhavya-Bazaar-Frontend-Diagnostic/1.0',
        'Origin': PRODUCTION_CONFIG.frontend,
        ...options.headers
      },
      timeout: 10000
    };

    if (options.data) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
    }

    const req = requestModule.request(requestOptions, (res) => {
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

// Test frontend configuration endpoints
async function testFrontendConfiguration() {
  console.log('\n🌐 Testing Frontend Configuration');
  console.log('----------------------------------');

  // Test runtime-config.js accessibility
  try {
    const configResponse = await makeRequest(`${PRODUCTION_CONFIG.frontend}/runtime-config.js`);
    console.log(`✅ Runtime config file status: ${configResponse.statusCode}`);
    
    if (configResponse.statusCode === 200) {
      console.log('📝 Runtime config content:');
      console.log(configResponse.data);
      
      // Check if config contains correct API_URL
      if (configResponse.data.includes('/api/v2')) {
        console.log('✅ Runtime config contains /api/v2 prefix');
      } else {
        console.log('❌ Runtime config missing /api/v2 prefix');
      }
    } else {
      console.log('❌ Could not fetch runtime config');
    }
  } catch (error) {
    console.log(`❌ Runtime config error: ${error.message}`);
  }
}

// Test API endpoints with and without prefix
async function testApiEndpoints() {
  console.log('\n🔗 Testing API Endpoint Patterns');
  console.log('---------------------------------');

  const endpointsToTest = [
    // Frontend is calling these (without /api/v2)
    {
      url: `${PRODUCTION_CONFIG.apiBase}/product/get-all-products`,
      description: 'Products (Frontend Pattern - NO /api/v2)',
      expected: 404
    },
    {
      url: `${PRODUCTION_CONFIG.apiBase}/user/login-user`,
      description: 'User Login (Frontend Pattern - NO /api/v2)',
      expected: 404
    },
    {
      url: `${PRODUCTION_CONFIG.apiBase}/event/get-all-events`,
      description: 'Events (Frontend Pattern - NO /api/v2)',
      expected: 404
    },
    
    // Backend actually serves these (with /api/v2)
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/product/get-all-products`,
      description: 'Products (Backend Pattern - WITH /api/v2)',
      expected: 200
    },
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/user/login-user`,
      description: 'User Login (Backend Pattern - WITH /api/v2)',
      expected: 200
    },
    {
      url: `${PRODUCTION_CONFIG.apiWithPrefix}/event/get-all-events`,
      description: 'Events (Backend Pattern - WITH /api/v2)',
      expected: 200
    }
  ];

  for (const endpoint of endpointsToTest) {
    try {
      console.log(`\n🧪 Testing: ${endpoint.description}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const response = await makeRequest(endpoint.url);
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === endpoint.expected) {
        console.log(`   ✅ Expected status received`);
      } else if (response.statusCode === 404) {
        console.log(`   ❌ Route not found (404)`);
      } else if (response.statusCode === 401) {
        console.log(`   ✅ Route exists but requires auth (401)`);
      } else if (response.statusCode === 200 || response.statusCode === 201) {
        console.log(`   ✅ Route working (${response.statusCode})`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test browser headers and configuration
async function testCorsAndHeaders() {
  console.log('\n🔒 Testing CORS and Headers');
  console.log('----------------------------');

  try {
    const corsResponse = await makeRequest(`${PRODUCTION_CONFIG.apiWithPrefix}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': PRODUCTION_CONFIG.frontend,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log(`CORS Preflight Status: ${corsResponse.statusCode}`);
    
    const allowOrigin = corsResponse.headers['access-control-allow-origin'];
    const allowCredentials = corsResponse.headers['access-control-allow-credentials'];
    
    console.log(`Access-Control-Allow-Origin: ${allowOrigin}`);
    console.log(`Access-Control-Allow-Credentials: ${allowCredentials}`);
    
    if (allowOrigin === PRODUCTION_CONFIG.frontend || allowOrigin === '*') {
      console.log('✅ CORS Origin: Properly configured');
    } else {
      console.log(`❌ CORS Origin Issue: Expected ${PRODUCTION_CONFIG.frontend}, got ${allowOrigin}`);
    }

  } catch (error) {
    console.log(`❌ CORS test error: ${error.message}`);
  }
}

// Check if there are any proxy/redirect rules
async function testProxyRedirects() {
  console.log('\n🔄 Testing Proxy and Redirects');
  console.log('------------------------------');

  // Test if there are any redirects from non-prefixed to prefixed URLs
  const redirectTests = [
    `${PRODUCTION_CONFIG.apiBase}/product/get-all-products`,
    `${PRODUCTION_CONFIG.apiBase}/user/login-user`,
    `${PRODUCTION_CONFIG.apiBase}/health`
  ];

  for (const url of redirectTests) {
    try {
      console.log(`\n🔄 Testing redirects for: ${url}`);
      
      const response = await makeRequest(url);
      
      // Check if there were any redirects
      if (response.headers.location) {
        console.log(`   ➡️  Redirects to: ${response.headers.location}`);
      } else {
        console.log(`   📍 No redirects (status: ${response.statusCode})`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Main diagnostic function
async function runDiagnostics() {
  try {
    await testFrontendConfiguration();
    await testApiEndpoints();
    await testCorsAndHeaders();
    await testProxyRedirects();
    
    console.log('\n📋 Diagnostic Summary');
    console.log('====================');
    console.log('');
    console.log('🔍 Key Findings:');
    console.log('1. Frontend is configured to call https://api.bhavyabazaar.com/api/v2');
    console.log('2. Backend serves endpoints at https://api.bhavyabazaar.com/api/v2/*');
    console.log('3. But somehow frontend is making calls without /api/v2 prefix');
    console.log('');
    console.log('💡 Possible Causes:');
    console.log('1. Runtime config not loading properly in browser');
    console.log('2. Some API calls hardcoded without using base URL');
    console.log('3. Build process not including runtime config');
    console.log('4. Redux actions not using window.RUNTIME_CONFIG');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Check browser dev tools for runtime config loading');
    console.log('2. Verify all API calls use base URL from config');
    console.log('3. Build and deploy with updated runtime config');
    console.log('4. Check network tab in browser for actual API calls');

  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}

// Run diagnostics
runDiagnostics();
