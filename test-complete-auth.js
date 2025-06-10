/**
 * Complete Authentication Flow Test
 * Tests user registration, login, and session management
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8000/api/auth';

// Configure axios to handle cookies
axios.defaults.withCredentials = true;

async function testUserRegistration() {
  console.log('🔐 Testing User Registration...');
  
  const userData = {
    name: 'Test User',
    phoneNumber: '9876543210',
    password: 'TestPassword123',
    email: 'testuser@example.com' // Optional
  };

  try {
    const response = await axios.post(`${API_BASE}/register-user`, userData);
    console.log('✅ User registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return null;
  }
}

async function testUserLogin() {
  console.log('🔐 Testing User Login...');
  
  const loginData = {
    phoneNumber: '9876543210',
    password: 'TestPassword123'
  };

  try {
    const response = await axios.post(`${API_BASE}/login-user`, loginData);
    console.log('✅ User login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSessionStatus() {
  console.log('🔍 Testing Session Status...');
  
  try {
    const response = await axios.get(`${API_BASE}/session-status`);
    console.log('✅ Session status check successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Session status check failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetCurrentUser() {
  console.log('👤 Testing Get Current User...');
  
  try {
    const response = await axios.get(`${API_BASE}/me`);
    console.log('✅ Get current user successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get current user failed:', error.response?.data || error.message);
    return null;
  }
}

async function testLogout() {
  console.log('🚪 Testing Logout...');
  
  try {
    const response = await axios.post(`${API_BASE}/logout`);
    console.log('✅ Logout successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    return null;
  }
}

async function runCompleteAuthTest() {
  console.log('🚀 Starting Complete Authentication Flow Test\n');
  
  // Test 1: User Registration
  const registrationResult = await testUserRegistration();
  if (!registrationResult) {
    console.log('❌ Test failed at registration step');
    return;
  }
  
  console.log('\n---\n');
  
  // Test 2: Check session after registration
  await testSessionStatus();
  
  console.log('\n---\n');
  
  // Test 3: Get current user data
  await testGetCurrentUser();
  
  console.log('\n---\n');
  
  // Test 4: Logout
  await testLogout();
  
  console.log('\n---\n');
  
  // Test 5: Check session after logout
  await testSessionStatus();
  
  console.log('\n---\n');
  
  // Test 6: Login with the registered user
  await testUserLogin();
  
  console.log('\n---\n');
  
  // Test 7: Check session after login
  await testSessionStatus();
  
  console.log('\n---\n');
  
  // Test 8: Get current user after login
  await testGetCurrentUser();
  
  console.log('\n🎉 Complete Authentication Flow Test Finished!');
}

// Run the test
runCompleteAuthTest().catch(console.error);
