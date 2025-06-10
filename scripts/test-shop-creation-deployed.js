/**
 * Test script to diagnose shop creation issues in deployed environment
 */

// Test the shop creation endpoint specifically
const testShopCreationEndpoint = async () => {
  console.log('🔍 Testing Shop Creation Endpoint in Deployed Environment...\n');
  
  // Test different possible API URLs
  const possibleUrls = [
    'https://api.bhavyabazaar.com/api/v2/shop/create-shop',
    'https://bhavyabazaar.com/api/v2/shop/create-shop',
    'https://api.bhavyabazaar.com/shop/create-shop'
  ];
  
  for (const url of possibleUrls) {
    try {
      console.log(`📡 Testing: ${url}`);
      
      // Make a test request to see if the endpoint exists
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://bhavyabazaar.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      if (response.status === 200 || response.status === 204) {
        console.log('   ✅ Endpoint accessible');
      } else {
        console.log('   ❌ Endpoint not accessible');
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  // Test the API base URL
  console.log('🌐 Testing API Base URL...');
  try {
    const baseUrl = 'https://api.bhavyabazaar.com/api/v2';
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Base API Status: ${response.status}`);
    if (response.ok) {
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`Base API Error: ${error.message}`);
  }
};

// Test network connectivity and CORS
const testNetworkAndCORS = async () => {
  console.log('\n🔗 Testing Network and CORS...');
  
  try {
    // Test if the main site is reachable
    const siteResponse = await fetch('https://bhavyabazaar.com', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Main site reachable');
    
    // Test if API domain is reachable
    const apiResponse = await fetch('https://api.bhavyabazaar.com', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ API domain reachable');
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Bhavya Bazaar Shop Creation Diagnostic Tool\n');
  console.log('=' .repeat(60));
  
  await testShopCreationEndpoint();
  await testNetworkAndCORS();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Diagnostic Complete!');
  console.log('\nIf you see errors above, the issue might be:');
  console.log('1. API server is down or misconfigured');
  console.log('2. CORS is not properly set up');
  console.log('3. SSL/TLS certificate issues');
  console.log('4. Route configuration problems');
  console.log('5. Network connectivity issues');
};

// Run if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  main().catch(console.error);
} else {
  // Browser environment
  main().catch(console.error);
}
