/**
 * Authentication Endpoints Test Script
 * Tests all authentication endpoints to identify issues
 */

const axios = require('axios');

// Configuration - Testing PRODUCTION endpoints
const BASE_URL = process.env.API_URL || 'https://api.bhavyabazaar.com';
const API_BASE = `${BASE_URL}/api/auth`;

console.log('🧪 Testing Authentication Endpoints');
console.log('Base URL:', BASE_URL);
console.log('API Base:', API_BASE);

async function testEndpoint(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      withCredentials: true,
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    console.log(`✅ ${endpoint} - Status: ${response.status}`);
    console.log('Response:', response.data);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.code}`);
    console.log('Error details:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message, status: error.response?.status };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AUTHENTICATION ENDPOINTS TEST');
  console.log('='.repeat(60));
  
  // Test 1: Ping endpoint
  await testEndpoint('/ping');
  
  // Test 2: Get current session (should fail without session)
  await testEndpoint('/me');
  
  // Test 3: Test user registration (with test data)
  const testUser = {
    name: 'Test User',
    phoneNumber: '9999999999',
    password: 'testpass123'
  };
  
  console.log('\n📝 Testing User Registration...');
  await testEndpoint('/register-user', 'POST', testUser);
  
  // Test 4: Test user login
  console.log('\n🔐 Testing User Login...');
  const userLogin = {
    phoneNumber: '9999999999',
    password: 'testpass123'
  };
  await testEndpoint('/login-user', 'POST', userLogin);
  
  // Test 5: Test seller registration
  const testSeller = {
    name: 'Test Shop',
    phoneNumber: '8888888888',
    password: 'testpass123',
    address: 'Test Address',
    zipCode: '123456'
  };
  
  console.log('\n📝 Testing Seller Registration...');
  await testEndpoint('/register-seller', 'POST', testSeller);
  
  // Test 6: Test seller login
  console.log('\n🔐 Testing Seller Login...');
  const sellerLogin = {
    phoneNumber: '8888888888',
    password: 'testpass123'
  };
  await testEndpoint('/login-seller', 'POST', sellerLogin);
  
  // Test 7: Test logout
  console.log('\n🚪 Testing Logout...');
  await testEndpoint('/logout', 'POST');
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Authentication Test Complete');
  console.log('='.repeat(60));
}

// Run the tests
runTests().catch(console.error);
