const axios = require('axios');

async function testUserRegistration() {
  try {
    console.log('🧪 Testing user registration...');
    
    const response = await axios.post('http://localhost:8000/api/auth/register-user', {
      name: 'Test User',
      phoneNumber: '9876543210',
      password: 'testpass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ User registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return null;
  }
}

async function testUserLogin() {
  try {
    console.log('🧪 Testing user login...');
    
    const response = await axios.post('http://localhost:8000/api/auth/login-user', {
      phoneNumber: '9876543210',
      password: 'testpass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ User login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSessionStatus() {
  try {
    console.log('🧪 Testing session status...');
    
    const response = await axios.get('http://localhost:8000/api/auth/session-status', {
      withCredentials: true
    });
    
    console.log('✅ Session status:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Session status failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  // Test session status first (should be unauthenticated)
  await testSessionStatus();
  console.log('');
  
  // Test user registration
  await testUserRegistration();
  console.log('');
  
  // Test session status after registration (should be authenticated)
  await testSessionStatus();
  console.log('');
  
  // Test login with same credentials
  await testUserLogin();
  console.log('');
  
  // Test session status after login
  await testSessionStatus();
  
  console.log('\n✅ All tests completed!');
}

runTests();
