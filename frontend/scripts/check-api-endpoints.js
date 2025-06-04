const axios = require('axios');

// Get API URL from command line arguments or fallback to default
const apiUrl = process.argv[2] || 'https://api.bhavyabazaar.com/api/v2';

console.log(`Checking API endpoints at: ${apiUrl}`);

// Define endpoints to check
const endpoints = [
  { url: '/', method: 'get', name: 'API Root' },
  { url: '/user/getuser', method: 'get', name: 'Get User', requiresAuth: true },
  { url: '/shop/get-all-products', method: 'get', name: 'Get All Products' },
  { url: '/product/get-all-products', method: 'get', name: 'Get All Products' },
  { url: '/event/get-all-events', method: 'get', name: 'Get All Events' },
  { url: '/health', method: 'get', name: 'Health Check' },
];

async function checkEndpoint(endpoint) {
  try {
    const config = {
      timeout: 5000,
      validateStatus: status => true, // Return response regardless of status code
    };
    
    if (endpoint.requiresAuth) {
      console.log(`⚠️ ${endpoint.name} requires authentication, skipping...`);
      return;
    }
    
    const url = `${apiUrl}${endpoint.url}`;
    console.log(`🔍 Checking ${endpoint.method.toUpperCase()} ${url}`);
    
    const response = await axios[endpoint.method](url, config);
    
    console.log(`${response.status < 400 ? '✅' : '❌'} ${endpoint.name}: Status ${response.status}`);
    
    if (response.status >= 400) {
      console.log(`   Error: ${response.statusText}`);
    }
    
    return response.status < 400;
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ${error.message}`);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log(`   API server may be down or unreachable at ${apiUrl}`);
    }
    return false;
  }
}

async function runChecks() {
  console.log('=== API Endpoint Check ===');
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }
  
  const successCount = results.filter(Boolean).length;
  console.log('=== Summary ===');
  console.log(`✅ ${successCount} endpoints accessible`);
  console.log(`❌ ${results.length - successCount} endpoints failed`);
  
  if (successCount === 0) {
    console.log('\n⚠️ All endpoint checks failed. The API may be down or the URL may be incorrect.');
    console.log(`   Please verify the API is running at ${apiUrl}`);
  }
}

runChecks();
