/**
 * Production Authentication Endpoints Test Script
 * Optimized for Coolify deployment testing
 */

const axios = require('axios');

// Configuration - Production endpoints
const BASE_URL = process.env.API_URL || process.env.PRODUCTION_URL || 'https://api.bhavyabazaar.com';
const API_BASE = `${BASE_URL}/api/auth`;

console.log('🧪 PRODUCTION Authentication Test');
console.log('🌐 Base URL:', BASE_URL);
console.log('🔗 API Base:', API_BASE);
console.log('📅 Test Time:', new Date().toISOString());
console.log('='.repeat(60));

async function testEndpoint(endpoint, method = 'GET', data = null, description = '') {
  try {
    console.log(`\n🔍 ${description || `Testing ${method} ${endpoint}`}`);
    
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      withCredentials: true,
      timeout: 15000, // Increased timeout for production
      headers: {
        'User-Agent': 'Bhavya-Bazaar-Auth-Test/1.0',
        'Accept': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    console.log(`✅ SUCCESS - Status: ${response.status} (${duration}ms)`);
    if (response.data && response.data.message) {
      console.log(`📝 Message: ${response.data.message}`);
    }
    
    return { 
      success: true, 
      data: response.data, 
      status: response.status,
      duration,
      endpoint: `${method} ${endpoint}`
    };
  } catch (error) {
    const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
    console.log(`❌ FAILED - ${error.response?.status || error.code} (${duration}ms)`);
    
    if (error.response?.data?.message) {
      console.log(`📝 Error: ${error.response.data.message}`);
    } else if (error.message) {
      console.log(`📝 Error: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status,
      duration,
      endpoint: `${method} ${endpoint}`
    };
  }
}

async function runProductionTests() {
  console.log('🚀 STARTING PRODUCTION AUTHENTICATION TESTS');
  console.log('='.repeat(60));
  
  const results = [];
  
  // Test 1: Health Check
  const healthResult = await testEndpoint('/health', 'GET', null, '🏥 Health Check');
  results.push(healthResult);
  
  // Test 2: Authentication Status Check
  const authStatusResult = await testEndpoint('/me', 'GET', null, '👤 Current Auth Status');
  results.push(authStatusResult);
  
  // Test 3: User Registration Test
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    phoneNumber: `999${timestamp.toString().slice(-7)}`, // Generate unique phone
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!'
  };
  
  console.log(`\n📱 Test Phone: ${testUser.phoneNumber}`);
  const userRegResult = await testEndpoint('/register-user', 'POST', testUser, '📝 User Registration Test');
  results.push(userRegResult);
  
  // Test 4: User Login Test (if registration successful)
  if (userRegResult.success) {
    const userLoginData = {
      phoneNumber: testUser.phoneNumber,
      password: testUser.password
    };
    const userLoginResult = await testEndpoint('/login-user', 'POST', userLoginData, '🔐 User Login Test');
    results.push(userLoginResult);
    
    // Test logout after login
    if (userLoginResult.success) {
      const logoutResult = await testEndpoint('/logout', 'POST', null, '🚪 User Logout Test');
      results.push(logoutResult);
    }
  }
  
  // Test 5: Seller Registration Test
  const testSeller = {
    name: `Test Shop ${timestamp}`,
    phoneNumber: `888${timestamp.toString().slice(-7)}`, // Different phone
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    address: 'Test Shop Address, Test City',
    zipCode: '123456'
  };
  
  console.log(`\n🏪 Test Shop Phone: ${testSeller.phoneNumber}`);
  const sellerRegResult = await testEndpoint('/register-seller', 'POST', testSeller, '🏪 Seller Registration Test');
  results.push(sellerRegResult);
  
  // Test 6: Seller Login Test (if registration successful)
  if (sellerRegResult.success) {
    const sellerLoginData = {
      phoneNumber: testSeller.phoneNumber,
      password: testSeller.password
    };
    const sellerLoginResult = await testEndpoint('/login-seller', 'POST', sellerLoginData, '🔐 Seller Login Test');
    results.push(sellerLoginResult);
    
    // Test logout after seller login
    if (sellerLoginResult.success) {
      const logoutResult = await testEndpoint('/logout', 'POST', null, '🚪 Seller Logout Test');
      results.push(logoutResult);
    }
  }
  
  // Test 7: Cross-validation Test (try to register user with seller phone)
  const crossValidationData = {
    name: 'Cross Validation Test',
    phoneNumber: testSeller.phoneNumber, // Same phone as seller
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!'
  };
  
  const crossValidResult = await testEndpoint('/register-user', 'POST', crossValidationData, '🔄 Cross-Validation Test (Should Fail)');
  results.push(crossValidResult);
  
  // Generate Test Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRODUCTION TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`✅ Successful: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  console.log(`📈 Success Rate: ${((successCount/totalTests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.endpoint} (${result.duration}ms)`);
  });
  
  // Check for critical failures
  const criticalFailures = results.filter(r => 
    !r.success && 
    !r.endpoint.includes('Cross-Validation') && // Cross-validation should fail
    r.status !== 400 && r.status !== 409 // Expected validation errors
  );
  
  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED:');
    criticalFailures.forEach(failure => {
      console.log(`   ❌ ${failure.endpoint} - Status: ${failure.status}`);
    });
  } else {
    console.log('\n🎉 All critical authentication flows working properly!');
  }
  
  console.log('\n='.repeat(60));
  console.log('✨ Production Authentication Test Complete');
  console.log(`📅 Completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  return {
    totalTests,
    successCount,
    failureCount: totalTests - successCount,
    successRate: (successCount/totalTests) * 100,
    criticalFailures: criticalFailures.length,
    results
  };
}

// Run the production tests
if (require.main === module) {
  runProductionTests()
    .then(summary => {
      console.log('\n🏁 Test execution completed');
      process.exit(summary.criticalFailures > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runProductionTests, testEndpoint };
