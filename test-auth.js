const axios = require('axios');

// Test the unified authentication system
async function testAuth() {
  const baseURL = 'http://localhost:8000';
  
  console.log('🧪 Testing unified authentication system...\n');
  
  try {
    // Test 1: User Registration (Phone-based)
    console.log('1. Testing User Registration (Phone-based)...');
    const userRegData = {
      name: 'Test User',
      phoneNumber: '9876543210',
      password: 'password123',
      email: 'test@example.com' // optional
    };
    
    try {
      const userRegResponse = await axios.post(`${baseURL}/api/auth/register-user`, userRegData);
      console.log('✅ User registration successful:', userRegResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ User already exists (expected for existing test data)');
      } else {
        console.log('❌ User registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 2: User Login (Phone-based)
    console.log('\n2. Testing User Login (Phone-based)...');
    try {
      const userLoginResponse = await axios.post(`${baseURL}/api/auth/login-user`, {
        phoneNumber: '9876543210',
        password: 'password123'
      }, { withCredentials: true });
      console.log('✅ User login successful:', userLoginResponse.data.message);
    } catch (error) {
      console.log('❌ User login failed:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Seller Registration (Phone-based)
    console.log('\n3. Testing Seller Registration (Phone-based)...');
    const sellerRegData = {
      name: 'Test Shop',
      phoneNumber: '9876543211',
      password: 'password123',
      address: '123 Test Street',
      zipCode: '12345'
    };
    
    try {
      const sellerRegResponse = await axios.post(`${baseURL}/api/auth/register-seller`, sellerRegData);
      console.log('✅ Seller registration successful:', sellerRegResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Seller already exists (expected for existing test data)');
      } else {
        console.log('❌ Seller registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 4: Seller Login (Phone-based)
    console.log('\n4. Testing Seller Login (Phone-based)...');
    try {
      const sellerLoginResponse = await axios.post(`${baseURL}/api/auth/login-seller`, {
        phoneNumber: '9876543211',
        password: 'password123'
      }, { withCredentials: true });
      console.log('✅ Seller login successful:', sellerLoginResponse.data.message);
    } catch (error) {
      console.log('❌ Seller login failed:', error.response?.data?.message || error.message);
    }
    
    // Test 5: Session Status Check
    console.log('\n5. Testing Session Status Check...');
    try {
      const sessionResponse = await axios.get(`${baseURL}/api/auth/session-status`, { withCredentials: true });
      console.log('✅ Session check successful:', {
        authenticated: sessionResponse.data.authenticated,
        userType: sessionResponse.data.userType
      });
    } catch (error) {
      console.log('❌ Session check failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Authentication system test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAuth();
