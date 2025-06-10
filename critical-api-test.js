/**
 * Critical API Endpoints Test
 * Tests the most important endpoints that commonly fail in production
 * 
 * This is a focused test for the core business-critical APIs
 */

const axios = require('axios');

class CriticalAPITest {
  constructor(baseUrl = 'https://api.bhavyabazaar.com') {
    this.baseUrl = baseUrl;
    this.results = [];
    console.log(`🎯 Testing critical API endpoints on: ${baseUrl}`);
  }

  async testEndpoint(name, method, endpoint, data = null, expectedStatus = [200, 201]) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: 10000,
        withCredentials: true
      };

      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);
      const success = expectedStatus.includes(response.status);
      
      this.results.push({
        name,
        endpoint,
        method,
        status: response.status,
        success,
        response: response.data
      });

      console.log(`${success ? '✅' : '❌'} ${name}: ${response.status}`);
      return { success, data: response.data, status: response.status };

    } catch (error) {
      const status = error.response?.status || 0;
      const success = expectedStatus.includes(status);
      
      this.results.push({
        name,
        endpoint,
        method,
        status,
        success,
        error: error.response?.data || error.message
      });

      console.log(`❌ ${name}: ${status} - ${error.message}`);
      return { success, error: error.response?.data || error.message, status };
    }
  }

  async runCriticalTests() {
    console.log('\n🔥 Testing Critical Business APIs...\n');

    // 1. Health Check (Most Basic)
    await this.testEndpoint('Basic Health Check', 'GET', '/api/ping');
    await this.testEndpoint('Auth Service Health', 'GET', '/api/auth/ping');
    await this.testEndpoint('API Health Check', 'GET', '/api/v2/health');

    // 2. Authentication Endpoints (Critical for all users)
    await this.testEndpoint('User Registration', 'POST', '/api/auth/register-user', {
      name: 'Test User Critical',
      phoneNumber: '8888888888',
      password: 'test123456'
    });

    await this.testEndpoint('User Login', 'POST', '/api/auth/login-user', {
      phoneNumber: '8888888888',
      password: 'test123456'
    });

    await this.testEndpoint('Seller Registration', 'POST', '/api/auth/register-seller', {
      name: 'Test Seller Critical',
      phoneNumber: '8888888889',
      password: 'test123456',
      address: 'Test Address',
      zipCode: '123456'
    });

    await this.testEndpoint('Seller Login', 'POST', '/api/auth/login-seller', {
      phoneNumber: '8888888889',
      password: 'test123456'
    });

    // 3. Core Business Functions
    await this.testEndpoint('Get All Products', 'GET', '/api/v2/product/get-all-products');
    await this.testEndpoint('Get All Events', 'GET', '/api/v2/event/get-all-events');

    // 4. Session Management
    await this.testEndpoint('Session Status', 'GET', '/api/auth/session-status');
    await this.testEndpoint('Get Current User', 'GET', '/api/auth/me', null, [200, 401]);

    // 5. Admin Functions (if accessible)
    await this.testEndpoint('Admin Login', 'POST', '/api/auth/login-admin', {
      email: 'admin@bhavyabazaar.com',
      password: 'admin123',
      adminKey: 'test-admin-key'
    }, [200, 401, 400]);

    // 6. Database Health
    await this.testEndpoint('Database Health', 'GET', '/api/v2/health/database');
    
    // 7. CORS Test
    await this.testEndpoint('CORS Debug', 'GET', '/api/cors-debug');

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRITICAL API TEST SUMMARY');
    console.log('='.repeat(60));

    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${Math.round(passed/total*100)}%)`);
    console.log(`❌ Failed: ${failed} (${Math.round(failed/total*100)}%)`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.name} (${result.method} ${result.endpoint}): ${result.status}`);
        if (result.error) {
          console.log(`     Error: ${JSON.stringify(result.error, null, 2)}`);
        }
      });
    }

    console.log('\n🎯 Critical Issues:');
    const authFailures = this.results.filter(r => 
      r.endpoint.includes('/api/auth/') && !r.success
    ).length;
    
    const healthFailures = this.results.filter(r => 
      (r.endpoint.includes('/health') || r.endpoint.includes('/ping')) && !r.success
    ).length;

    const productFailures = this.results.filter(r => 
      r.endpoint.includes('/product/') && !r.success
    ).length;

    if (authFailures > 0) console.log(`   🔐 Authentication System: ${authFailures} failures`);
    if (healthFailures > 0) console.log(`   🩺 Health Monitoring: ${healthFailures} failures`);
    if (productFailures > 0) console.log(`   📦 Product System: ${productFailures} failures`);

    console.log('='.repeat(60));

    if (failed === 0) {
      console.log('🎉 ALL CRITICAL APIS ARE WORKING!');
    } else {
      console.log('⚠️ CRITICAL ISSUES DETECTED - IMMEDIATE ATTENTION REQUIRED');
    }
  }
}

// Quick test function
async function quickTest(baseUrl) {
  const tester = new CriticalAPITest(baseUrl);
  await tester.runCriticalTests();
  return tester.results;
}

// Script execution
async function main() {
  const baseUrl = process.argv[2] || 'https://api.bhavyabazaar.com';
  await quickTest(baseUrl);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CriticalAPITest, quickTest };
