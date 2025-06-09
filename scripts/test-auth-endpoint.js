/**
 * Test Authentication Endpoint
 * Tests the /auth/me endpoint to verify it's working correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testAuthEndpoint() {
  console.log('🧪 Testing Authentication Endpoint...\n');
  
  try {
    // Test 1: Call /auth/me without authentication
    console.log('📝 Test 1: Call /auth/me without authentication');
    const response1 = await axios.get(`${BASE_URL}/auth/me`, {
      validateStatus: () => true // Don't throw on error status codes
    });
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Response:`, response1.data);
    console.log('   Expected: 401 Unauthorized\n');
    
    // Test 2: Check if endpoint exists (should not get 404)
    if (response1.status === 404) {
      console.log('❌ ERROR: /auth/me endpoint not found!');
      console.log('   The route might not be properly mounted.');
      return;
    }
    
    // Test 3: Test with invalid cookie
    console.log('📝 Test 2: Call /auth/me with invalid cookie');
    const response2 = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Cookie': 'token=invalid_token_here'
      },
      validateStatus: () => true
    });
    
    console.log(`   Status: ${response2.status}`);
    console.log(`   Response:`, response2.data);
    console.log('   Expected: 401 Unauthorized\n');
    
    console.log('✅ Authentication endpoint tests completed');
    console.log('💡 To test with valid authentication, login through the frontend first');
    
  } catch (error) {
    console.error('❌ Error testing auth endpoint:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 8000');
    }
  }
}

// Run the test
testAuthEndpoint();
