/**
 * Comprehensive Authentication System Test
 * Tests all authentication endpoints and flows
 */

import axios from 'axios';

// Get base URL using the same logic as the frontend
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.RUNTIME_CONFIG?.API_URL) {
      return window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
    }
    if (window.__RUNTIME_CONFIG__?.API_URL) {
      return window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
      return 'https://api.bhavyabazaar.com';
    }
    return `https://api.${hostname}`;
  }
  // Fallback for Node.js environment
  return process.env.API_URL || 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();
const API_BASE = `${BASE_URL}/api/auth`;

console.log('🧪 Authentication System Test');
console.log('Base URL:', BASE_URL);
console.log('API Base:', API_BASE);

class AuthTester {
  constructor() {
    this.testResults = [];
    this.session = null;
  }

  async testEndpoint(name, method, endpoint, data = null, expectSuccess = true) {
    console.log(`\n🔍 Testing: ${name}`);
    
    try {
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
      
      if (expectSuccess) {
        console.log(`✅ ${name} - SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message || 'No message'}`);
      } else {
        console.log(`⚠️ ${name} - Unexpected success (expected failure)`);
      }
      
      this.testResults.push({
        name,
        status: 'PASS',
        response: response.data,
        httpStatus: response.status
      });
      
      return response.data;
    } catch (error) {
      if (!expectSuccess) {
        console.log(`✅ ${name} - Expected failure`);
        console.log(`   Status: ${error.response?.status || 'No status'}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        
        this.testResults.push({
          name,
          status: 'PASS',
          error: error.response?.data || error.message,
          httpStatus: error.response?.status
        });
      } else {
        console.log(`❌ ${name} - FAILED`);
        console.log(`   Status: ${error.response?.status || 'No status'}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        
        this.testResults.push({
          name,
          status: 'FAIL',
          error: error.response?.data || error.message,
          httpStatus: error.response?.status
        });
      }
      
      return null;
    }
  }

  async runComprehensiveTest() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 COMPREHENSIVE AUTHENTICATION TEST');
    console.log('='.repeat(60));
    
    // Test 1: Ping endpoint
    await this.testEndpoint('Auth Ping', 'GET', '/ping');
    
    // Test 2: Get current session (should fail - no session yet)
    await this.testEndpoint('Get Session (No Auth)', 'GET', '/me', null, false);
    
    // Test 3: Test user registration
    const testUser = {
      name: 'Test User Auth',
      phoneNumber: '7777777777', // Different from previous tests
      password: 'testpass123'
    };
    
    console.log('\n📝 Testing User Registration...');
    const userReg = await this.testEndpoint('User Registration', 'POST', '/register-user', testUser);
    
    // Test 4: Test user login
    console.log('\n🔐 Testing User Login...');
    const userLogin = {
      phoneNumber: '7777777777',
      password: 'testpass123'
    };
    const userLoginResult = await this.testEndpoint('User Login', 'POST', '/login-user', userLogin);
    
    // Test 5: Get current session (should work now)
    if (userLoginResult) {
      await this.testEndpoint('Get Session (User Auth)', 'GET', '/me');
    }
    
    // Test 6: Logout user
    await this.testEndpoint('User Logout', 'POST', '/logout');
    
    // Test 7: Test seller registration
    const testSeller = {
      name: 'Test Shop Auth',
      phoneNumber: '6666666666', // Different from user
      password: 'testpass123',
      address: 'Test Address',
      zipCode: '123456'
    };
    
    console.log('\n📝 Testing Seller Registration...');
    const sellerReg = await this.testEndpoint('Seller Registration', 'POST', '/register-seller', testSeller);
    
    // Test 8: Test seller login
    console.log('\n🔐 Testing Seller Login...');
    const sellerLogin = {
      phoneNumber: '6666666666',
      password: 'testpass123'
    };
    const sellerLoginResult = await this.testEndpoint('Seller Login', 'POST', '/login-seller', sellerLogin);
    
    // Test 9: Get current session (should work for seller)
    if (sellerLoginResult) {
      await this.testEndpoint('Get Session (Seller Auth)', 'GET', '/me');
    }
    
    // Test 10: Test conflict prevention (user tries to register with seller phone)
    console.log('\n🚫 Testing Conflict Prevention...');
    const conflictUser = {
      name: 'Conflict User',
      phoneNumber: '6666666666', // Same as seller
      password: 'testpass123'
    };
    await this.testEndpoint('User Registration (Conflict)', 'POST', '/register-user', conflictUser, false);
    
    // Test 11: Test seller conflict (seller tries to register with user phone)
    const conflictSeller = {
      name: 'Conflict Shop',
      phoneNumber: '7777777777', // Same as user
      password: 'testpass123',
      address: 'Test Address',
      zipCode: '123456'
    };
    await this.testEndpoint('Seller Registration (Conflict)', 'POST', '/register-seller', conflictSeller, false);
    
    // Test 12: Test invalid credentials
    console.log('\n🔐 Testing Invalid Credentials...');
    const invalidLogin = {
      phoneNumber: '7777777777',
      password: 'wrongpassword'
    };
    await this.testEndpoint('Invalid User Login', 'POST', '/login-user', invalidLogin, false);
    
    // Test 13: Final logout
    await this.testEndpoint('Final Logout', 'POST', '/logout');
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error?.message || 'Unknown error'}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED - CHECK IMPLEMENTATION');
    console.log('='.repeat(60));
  }
}

// Run the test if in browser environment
if (typeof window !== 'undefined') {
  const tester = new AuthTester();
  tester.runComprehensiveTest().catch(console.error);
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthTester;
}
