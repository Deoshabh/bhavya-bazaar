// Check API proxy configuration and connection status
const axios = require('axios');
const https = require('https');

// Constants
const API_BASE_URLS = [
  'https://api.bhavyabazaar.com',
  'https://api.bhavyabazaar.com/api/v2',
  'http://localhost:8000/api/v2',
].filter(Boolean);

const ENDPOINTS = [
  '/',
  '/health',
  '/api/v2/health',
  '/api/v2/product/get-all-products',
  '/api/v2/user/getuser',
];

const checkEndpoint = async (baseUrl, endpoint) => {
  console.log(`Testing ${baseUrl}${endpoint}`);
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true, // don't throw on any status code
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // allow self-signed certificates
      })
    });
    
    const success = response.status < 400;
    const authRequired = response.status === 401;
    
    return {
      url,
      status: response.status,
      statusText: response.statusText,
      success,
      authRequired,
      message: authRequired ? 'Authentication required' : (success ? 'Success' : 'Failed')
    };
  } catch (error) {
    console.error(`Error testing ${url}:`, error.message);
    return {
      url,
      status: 0,
      statusText: error.code || 'Unknown error',
      success: false,
      authRequired: false,
      message: error.message
    };
  }
};

// Run tests for all base URLs against all endpoints
const runTests = async () => {
  console.log('=== BHAVYA BAZAAR API CONNECTIVITY CHECK ===');
  console.log('Testing API endpoints with multiple base URLs...\n');
  
  const results = [];
  
  for (const baseUrl of API_BASE_URLS) {
    console.log(`\n--- Testing Base URL: ${baseUrl} ---`);
    
    for (const endpoint of ENDPOINTS) {
      const result = await checkEndpoint(baseUrl, endpoint);
      results.push(result);
      
      // Print result with color coding
      const statusColor = result.success ? '\x1b[32m' : (result.authRequired ? '\x1b[33m' : '\x1b[31m');
      const statusReset = '\x1b[0m';
      console.log(
        `${statusColor}${result.status}${statusReset} - ${result.url} - ${result.message}`
      );
    }
  }
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  const successful = results.filter(r => r.success || r.authRequired).length;
  const total = results.length;
  
  console.log(`${successful} of ${total} endpoints accessible (includes auth required)`);
  
  // Recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  if (successful === 0) {
    console.log('❌ ALL API endpoints are inaccessible.');
    console.log('   - Check if the API server is running');
    console.log('   - Verify CORS settings on the backend');
    console.log('   - Check network connectivity between frontend and backend');
  } else if (successful < total / 2) {
    console.log('⚠️ Most API endpoints are inaccessible.');
    console.log('   - Check paths in your API requests');
    console.log('   - Verify runtime-config.js API_URL is correct');
  } else {
    console.log('✅ Most API endpoints are accessible.');
    
    // Find the best working base URL
    const baseUrlSuccessCount = {};
    API_BASE_URLS.forEach(baseUrl => {
      baseUrlSuccessCount[baseUrl] = results
        .filter(r => r.url.startsWith(baseUrl) && (r.success || r.authRequired))
        .length;
    });
    
    const bestBaseUrl = Object.keys(baseUrlSuccessCount)
      .sort((a, b) => baseUrlSuccessCount[b] - baseUrlSuccessCount[a])[0];
      
    if (bestBaseUrl) {
      console.log(`\nRecommended API_URL: ${bestBaseUrl}`);
      console.log('Update this value in runtime-config.js and rebuild.');
    }
  }
};

runTests();
