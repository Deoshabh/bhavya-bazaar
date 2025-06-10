#!/usr/bin/env node

/**
 * Authentication Fix Verification Test
 * Tests the fixed authentication endpoints and session management
 */

const axios = require('axios');

const baseURL = 'http://localhost:8000';
const testCredentials = {
  seller: {
    phoneNumber: '9999999999',
    password: 'test123'
  },
  user: {
    phoneNumber: '9999999998', 
    password: 'test123'
  }
};

console.log('🧪 Testing Authentication Fix...\n');

async function testSellerAuth() {
  console.log('1. Testing Seller Authentication Flow...');
  
  try {
    // Test seller login
    console.log('   → Logging in seller...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login-seller`, testCredentials.seller, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (loginResponse.data.success) {
      console.log('   ✅ Seller login successful');
      
      // Test session validation
      console.log('   → Validating seller session...');
      const sessionResponse = await axios.get(`${baseURL}/api/auth/me`, {
        withCredentials: true
      });
      
      if (sessionResponse.data.success && sessionResponse.data.userType === 'seller') {
        console.log('   ✅ Seller session validation successful');
        
        // Test protected endpoint
        console.log('   → Testing protected endpoint...');
        const protectedResponse = await axios.get(`${baseURL}/api/v2/shop/getSeller`, {
          withCredentials: true
        });
        
        if (protectedResponse.data.success) {
          console.log('   ✅ Protected endpoint access successful');
        } else {
          console.log('   ❌ Protected endpoint access failed');
        }
        
        // Test logout
        console.log('   → Testing seller logout...');
        const logoutResponse = await axios.post(`${baseURL}/api/auth/logout/seller`, {}, {
          withCredentials: true
        });
        
        if (logoutResponse.data.success) {
          console.log('   ✅ Seller logout successful');
        } else {
          console.log('   ❌ Seller logout failed');
        }
        
      } else {
        console.log('   ❌ Seller session validation failed');
      }
      
    } else {
      console.log('   ❌ Seller login failed');
    }
    
  } catch (error) {
    console.log(`   ❌ Seller auth test failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testConversationEndpoint() {
  console.log('\n2. Testing Conversation Endpoint Fix...');
  
  try {
    // First login as user
    console.log('   → Logging in user...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login-user`, testCredentials.user, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (loginResponse.data.success) {
      console.log('   ✅ User login successful');
      const userId = loginResponse.data.user.id;
      
      // Test conversation endpoint
      console.log('   → Testing conversation endpoint...');
      const conversationResponse = await axios.get(`${baseURL}/api/v2/conversation/get-all-conversation/${userId}`, {
        withCredentials: true
      });
      
      if (conversationResponse.status === 200 || conversationResponse.status === 201) {
        console.log('   ✅ Conversation endpoint accessible');
      } else {
        console.log('   ❌ Conversation endpoint failed');
      }
      
    } else {
      console.log('   ❌ User login failed');
    }
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ❌ Conversation endpoint still returns 404');
    } else {
      console.log(`   ❌ Conversation test failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

async function testSessionPersistence() {
  console.log('\n3. Testing Session Persistence...');
  
  try {
    // Login seller
    console.log('   → Logging in seller...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login-seller`, testCredentials.seller, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (loginResponse.data.success) {
      console.log('   ✅ Seller login successful');
      
      // Wait a moment then check session persistence
      console.log('   → Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('   → Checking session persistence...');
      const sessionResponse = await axios.get(`${baseURL}/api/auth/me`, {
        withCredentials: true
      });
      
      if (sessionResponse.data.success && sessionResponse.data.userType === 'seller') {
        console.log('   ✅ Session persisted successfully');
      } else {
        console.log('   ❌ Session persistence failed');
      }
      
    } else {
      console.log('   ❌ Initial login failed');
    }
    
  } catch (error) {
    console.log(`   ❌ Session persistence test failed: ${error.response?.data?.message || error.message}`);
  }
}

async function runTests() {
  try {
    await testSellerAuth();
    await testConversationEndpoint();
    await testSessionPersistence();
    
    console.log('\n🎉 Authentication fix tests completed!');
    console.log('\nIf all tests passed, the authentication issues should be resolved.');
    console.log('You can now test the frontend application.');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Handle script execution
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
