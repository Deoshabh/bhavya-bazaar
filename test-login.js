// Test seller login endpoint directly
const axios = require('axios');

async function testSellerLogin() {
  try {
    console.log('Testing seller login at http://localhost:8001/api/auth/login-seller');
    
    const response = await axios.post('http://localhost:8001/api/auth/login-seller', {
      phoneNumber: '9999999999', // Test phone number
      password: 'test123'        // Test password
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', response.data);
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

// Test authentication check
async function testAuthCheck() {
  try {
    console.log('Testing auth check at http://localhost:8001/api/auth/me');
    
    const response = await axios.get('http://localhost:8001/api/auth/me', {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Auth check successful:', response.data);
  } catch (error) {
    console.log('❌ Auth check failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

async function runTests() {
  console.log('🧪 Testing backend authentication endpoints...\n');
  
  await testAuthCheck();
  console.log('');
  await testSellerLogin();
}

runTests();
