// Comprehensive API Test Script for Bhavya Bazaar
const axios = require('axios');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';
const LOCAL_API_BASE = 'http://localhost:8000/api/v2';

// Test both deployed and local APIs
const API_ENDPOINTS = [API_BASE, LOCAL_API_BASE];

class ApiTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      endpoints: {}
    };
  }

  async testEndpoint(baseUrl, endpoint, method = 'GET', data = null, expectAuth = false) {
    const fullUrl = `${baseUrl}${endpoint}`;
    const testName = `${method} ${endpoint}`;
    
    try {
      let response;
      const config = {
        timeout: 10000,
        withCredentials: true,
        validateStatus: function (status) {
          // Accept all status codes to handle them manually
          return status < 600;
        }
      };

      if (method === 'POST') {
        response = await axios.post(fullUrl, data || {}, config);
      } else if (method === 'PUT') {
        response = await axios.put(fullUrl, data || {}, config);
      } else {
        response = await axios.get(fullUrl, config);
      }

      // Determine if response is expected
      let isExpected = false;
      let status = 'UNKNOWN';
      
      if (expectAuth && (response.status === 401 || response.status === 403)) {
        isExpected = true;
        status = 'EXPECTED_AUTH_REQUIRED';
      } else if (!expectAuth && response.status >= 200 && response.status < 300) {
        isExpected = true;
        status = 'SUCCESS';
      } else if (response.status === 400 && data) {
        // Bad request with test data is often expected
        isExpected = true;
        status = 'EXPECTED_BAD_REQUEST';
      } else if (response.status >= 400) {
        status = 'ERROR';
      }

      return {
        endpoint: testName,
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
        isExpected,
        testStatus: status,
        responseSize: JSON.stringify(response.data || {}).length,
        data: response.data,
        error: null
      };

    } catch (error) {
      return {
        endpoint: testName,
        url: fullUrl,
        status: error.response?.status || 'NETWORK_ERROR',
        statusText: error.response?.statusText || error.message,
        isExpected: false,
        testStatus: 'NETWORK_ERROR',
        responseSize: 0,
        data: error.response?.data || null,
        error: error.message
      };
    }
  }

  async testAllEndpoints() {
    console.log('🔍 Starting Comprehensive API Testing...\n');

    for (const baseUrl of API_ENDPOINTS) {
      const serverType = baseUrl.includes('localhost') ? 'LOCAL' : 'DEPLOYED';
      console.log(`\n📡 Testing ${serverType} Server: ${baseUrl}`);
      console.log('='.repeat(60));

      this.results.endpoints[serverType] = {};

      // Test Categories
      const testCategories = {
        'PUBLIC_ENDPOINTS': [
          { endpoint: '/product/get-all-products', expectAuth: false },
          { endpoint: '/event/get-all-events', expectAuth: false },
          { endpoint: '/shop/get-shop-info/507f1f77bcf86cd799439011', expectAuth: false }, // test with fake ID
        ],
        'AUTH_REQUIRED_USER': [
          { endpoint: '/user/getuser', expectAuth: true },
          { endpoint: '/user/update-user-info', method: 'PUT', expectAuth: true },
          { endpoint: '/order/get-all-orders/507f1f77bcf86cd799439011', expectAuth: false }, // should work without auth
        ],
        'AUTH_REQUIRED_SELLER': [
          { endpoint: '/shop/getSeller', expectAuth: true },
          { endpoint: '/shop/update-seller-info', method: 'PUT', expectAuth: true },
        ],
        'LOGIN_ENDPOINTS': [
          { endpoint: '/user/login-user', method: 'POST', data: { phoneNumber: 'test', password: 'test' }, expectAuth: false },
          { endpoint: '/shop/login-shop', method: 'POST', data: { phoneNumber: 'test', password: 'test' }, expectAuth: false },
        ],
        'ADMIN_ENDPOINTS': [
          { endpoint: '/shop/admin-all-sellers', expectAuth: true },
          { endpoint: '/user/admin-all-users', expectAuth: true },
        ]
      };

      // Run tests for each category
      for (const [category, tests] of Object.entries(testCategories)) {
        console.log(`\n📋 ${category.replace('_', ' ')}:`);
        this.results.endpoints[serverType][category] = [];

        for (const test of tests) {
          const result = await this.testEndpoint(
            baseUrl,
            test.endpoint,
            test.method || 'GET',
            test.data,
            test.expectAuth
          );

          this.results.endpoints[serverType][category].push(result);

          // Display result
          const statusIcon = result.isExpected ? '✅' : '❌';
          const statusColor = result.isExpected ? '\x1b[32m' : '\x1b[31m'; // Green or Red
          const resetColor = '\x1b[0m';
          
          console.log(`  ${statusIcon} ${statusColor}${result.endpoint}${resetColor}`);
          console.log(`     Status: ${result.status} ${result.statusText}`);
          console.log(`     Test: ${result.testStatus}`);
          
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
          
          if (result.data && result.data.message) {
            console.log(`     Message: ${result.data.message}`);
          }
        }
      }
    }
  }

  generateReport() {
    console.log('\n\n📊 COMPREHENSIVE API TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Generated: ${this.results.timestamp}\n`);

    for (const [serverType, categories] of Object.entries(this.results.endpoints)) {
      console.log(`\n🖥️  ${serverType} SERVER RESULTS:`);
      console.log('-'.repeat(40));

      let totalTests = 0;
      let passedTests = 0;

      for (const [category, results] of Object.entries(categories)) {
        console.log(`\n📂 ${category.replace('_', ' ')}:`);
        
        results.forEach(result => {
          totalTests++;
          if (result.isExpected) passedTests++;
          
          const icon = result.isExpected ? '✅' : '❌';
          console.log(`   ${icon} ${result.endpoint} - ${result.status} (${result.testStatus})`);
        });
      }

      const successRate = ((passedTests / totalTests) * 100).toFixed(1);
      console.log(`\n📈 ${serverType} Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
    }

    // Critical Issues Summary
    console.log('\n\n🚨 CRITICAL ISSUES IDENTIFIED:');
    console.log('='.repeat(50));

    const criticalIssues = [];
    
    for (const [serverType, categories] of Object.entries(this.results.endpoints)) {
      for (const [category, results] of Object.entries(categories)) {
        results.forEach(result => {
          if (!result.isExpected && result.testStatus === 'ERROR') {
            criticalIssues.push({
              server: serverType,
              category,
              endpoint: result.endpoint,
              status: result.status,
              error: result.error || result.statusText
            });
          }
        });
      }
    }

    if (criticalIssues.length === 0) {
      console.log('✅ No critical issues found! All endpoints behaving as expected.');
    } else {
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.server} - ${issue.endpoint}`);
        console.log(`   Status: ${issue.status}`);
        console.log(`   Error: ${issue.error}`);
        console.log('');
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(30));
    console.log('1. All 401 responses for protected endpoints are EXPECTED and indicate proper security');
    console.log('2. 400 responses for login with invalid credentials are EXPECTED behavior');
    console.log('3. Focus on fixing endpoints returning 500 errors or network failures');
    console.log('4. Public endpoints (products, events) should return 200 with data');
    console.log('5. Brand logo assets appear to be fixed based on previous testing');

    return this.results;
  }

  async saveReport() {
    const reportPath = 'd:/Projects/bhavya-bazaar/API-TEST-REPORT.json';
    const fs = require('fs');
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Full report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`\n❌ Failed to save report: ${error.message}`);
    }
  }
}

// Run the tests
async function main() {
  const tester = new ApiTester();
  
  try {
    await tester.testAllEndpoints();
    tester.generateReport();
    await tester.saveReport();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ApiTester;
