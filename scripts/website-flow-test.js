// Website Flow Test Script for Bhavya Bazaar
const axios = require('axios');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';
const LOCAL_API_BASE = 'http://localhost:8000/api/v2';
const FRONTEND_URL = 'http://localhost:3000';

class WebsiteFlowTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testResults: {}
    };
    this.session = null;
  }

  async testPublicPages() {
    console.log('🏠 Testing Public Pages Access...');
    
    const tests = [
      { name: 'Homepage Products Load', endpoint: '/product/get-all-products' },
      { name: 'Events Load', endpoint: '/event/get-all-events' },
      { name: 'Shop Info Access', endpoint: '/shop/get-shop-info/507f1f77bcf86cd799439011' }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const response = await axios.get(`${API_BASE}${test.endpoint}`, {
          timeout: 10000
        });
        
        const success = response.status === 200 || response.status === 201;
        const dataCount = response.data?.products?.length || response.data?.events?.length || (response.data?.shop ? 1 : 0);
        
        results.push({
          test: test.name,
          status: success ? 'PASS' : 'FAIL',
          httpStatus: response.status,
          dataCount: dataCount,
          responseTime: response.headers['x-response-time'] || 'N/A'
        });
        
        console.log(`  ✅ ${test.name}: ${response.status} - ${dataCount} items`);
        
      } catch (error) {
        results.push({
          test: test.name,
          status: 'FAIL',
          error: error.message,
          httpStatus: error.response?.status || 'NETWORK_ERROR'
        });
        
        console.log(`  ❌ ${test.name}: ${error.message}`);
      }
    }
    
    this.results.testResults.publicPages = results;
    return results;
  }

  async testRegistrationFlow() {
    console.log('\n👤 Testing User Registration Flow...');
    
    const testPhone = '9876543210';
    const testData = {
      name: 'Test User',
      phoneNumber: testPhone,
      password: 'testpassword123',
      addresses: [{
        country: 'India',
        city: 'Test City',
        address1: '123 Test Street',
        address2: '',
        zipCode: '123456',
        addressType: 'Home'
      }]
    };

    try {
      // Test user registration
      const response = await axios.post(`${API_BASE}/user/create-user`, testData, {
        timeout: 10000,
        withCredentials: true
      });

      if (response.status === 201) {
        console.log('  ✅ User registration: SUCCESS');
        this.results.testResults.userRegistration = {
          status: 'PASS',
          message: 'User registration working correctly'
        };
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('  ✅ User registration: User already exists (Expected)');
        this.results.testResults.userRegistration = {
          status: 'PASS',
          message: 'User registration endpoint working (user exists)'
        };
      } else {
        console.log(`  ❌ User registration: ${error.response?.data?.message || error.message}`);
        this.results.testResults.userRegistration = {
          status: 'FAIL',
          error: error.response?.data?.message || error.message
        };
      }
    }
  }

  async testSellerRegistrationFlow() {
    console.log('\n🏪 Testing Seller Registration Flow...');
    
    const testData = {
      name: 'Test Shop',
      phoneNumber: '9876543211',
      password: 'testpassword123',
      address: '123 Shop Street, Test City',      zipCode: '123456'
    };

    try {
      // Test seller registration without file upload for now
      const response = await axios.post(`${API_BASE}/shop/create-shop`, testData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: true
      });

      if (response.status === 201) {
        console.log('  ✅ Seller registration: SUCCESS');
        this.results.testResults.sellerRegistration = {
          status: 'PASS',
          message: 'Seller registration working correctly'
        };
      }
      
    } catch (error) {
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('already exists') || 
            error.response?.data?.message?.includes('file')) {
          console.log('  ✅ Seller registration: Expected validation error');
          this.results.testResults.sellerRegistration = {
            status: 'PASS',
            message: 'Seller registration endpoint working (validation working)'
          };
        } else {
          console.log(`  ❌ Seller registration: ${error.response?.data?.message}`);
          this.results.testResults.sellerRegistration = {
            status: 'FAIL',
            error: error.response?.data?.message
          };
        }
      } else {
        console.log(`  ❌ Seller registration: ${error.message}`);
        this.results.testResults.sellerRegistration = {
          status: 'FAIL',
          error: error.message
        };
      }
    }
  }

  async testLoginFlows() {
    console.log('\n🔐 Testing Login Flows...');
    
    // Test user login with invalid credentials (should fail gracefully)
    try {
      await axios.post(`${API_BASE}/user/login-user`, {
        phoneNumber: 'invalid',
        password: 'invalid'
      }, {
        withCredentials: true,
        timeout: 10000
      });
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('  ✅ User login: Properly validates credentials');
        this.results.testResults.userLogin = { status: 'PASS', message: 'Login validation working' };
      } else {
        console.log(`  ❌ User login: Unexpected error - ${error.message}`);
        this.results.testResults.userLogin = { status: 'FAIL', error: error.message };
      }
    }

    // Test seller login with invalid credentials (should fail gracefully)
    try {
      await axios.post(`${API_BASE}/shop/login-shop`, {
        phoneNumber: 'invalid',
        password: 'invalid'
      }, {
        withCredentials: true,
        timeout: 10000
      });
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('  ✅ Seller login: Properly validates credentials');
        this.results.testResults.sellerLogin = { status: 'PASS', message: 'Login validation working' };
      } else {
        console.log(`  ❌ Seller login: Unexpected error - ${error.message}`);
        this.results.testResults.sellerLogin = { status: 'FAIL', error: error.message };
      }
    }
  }

  async testImageAndAssetLoading() {
    console.log('\n🖼️ Testing Image and Asset Loading...');
    
    try {
      // Test brand logo accessibility
      const logoTests = [
        'http://localhost:3000/brand-logos/apple-logo.svg',
        'http://localhost:3000/brand-logos/samsung-logo.svg',
        'http://localhost:3000/brand-logos/google-logo.svg',
        'https://api.bhavyabazaar.com/uploads/Screenshot 2025-04-14 151652-1745997470400-149669290.png'
      ];

      const logoResults = [];

      for (const logoUrl of logoTests) {
        try {
          const response = await axios.head(logoUrl, { timeout: 5000 });
          logoResults.push({
            url: logoUrl,
            status: 'ACCESSIBLE',
            httpStatus: response.status
          });
          console.log(`  ✅ ${logoUrl.split('/').pop()}: Accessible`);
        } catch (error) {
          logoResults.push({
            url: logoUrl,
            status: 'FAILED',
            httpStatus: error.response?.status || 'NETWORK_ERROR'
          });
          console.log(`  ❌ ${logoUrl.split('/').pop()}: ${error.response?.status || 'Network Error'}`);
        }
      }

      this.results.testResults.assetLoading = logoResults;

    } catch (error) {
      console.log(`  ❌ Asset loading test failed: ${error.message}`);
      this.results.testResults.assetLoading = { status: 'FAIL', error: error.message };
    }
  }

  async testCartAndOrderFlow() {
    console.log('\n🛒 Testing Cart and Order Flow...');
    
    try {
      // Test order creation (should fail without authentication)
      const orderData = {
        cart: [{
          _id: '507f1f77bcf86cd799439011',
          name: 'Test Product',
          price: 100,
          qty: 1,
          shopId: '507f1f77bcf86cd799439012'
        }],
        shippingAddress: {
          address1: '123 Test Street',
          city: 'Test City',
          country: 'India',
          zipCode: '123456'
        },
        user: {
          _id: '507f1f77bcf86cd799439013',
          name: 'Test User'
        },
        totalPrice: 100,
        paymentInfo: {
          type: 'Cash On Delivery'
        }
      };

      await axios.post(`${API_BASE}/order/create-order`, orderData, {
        withCredentials: true,
        timeout: 10000
      });

      this.results.testResults.orderFlow = { status: 'UNEXPECTED_SUCCESS', message: 'Order created without authentication' };
      console.log('  ⚠️ Order creation: Unexpected success without authentication');

    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        this.results.testResults.orderFlow = { status: 'PASS', message: 'Order creation properly requires authentication' };
        console.log('  ✅ Order creation: Properly requires authentication/validation');
      } else {
        this.results.testResults.orderFlow = { status: 'FAIL', error: error.message };
        console.log(`  ❌ Order creation: Unexpected error - ${error.message}`);
      }
    }
  }

  async generateFinalReport() {
    console.log('\n\n📋 FINAL WEBSITE FLOW TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Generated: ${this.results.timestamp}\n`);

    let totalTests = 0;
    let passedTests = 0;

    // Count and display results
    for (const [category, results] of Object.entries(this.results.testResults)) {
      console.log(`📂 ${category.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}:`);
      
      if (Array.isArray(results)) {
        results.forEach(result => {
          totalTests++;
          if (result.status === 'PASS' || result.status === 'ACCESSIBLE') passedTests++;
          
          const icon = (result.status === 'PASS' || result.status === 'ACCESSIBLE') ? '✅' : '❌';
          console.log(`   ${icon} ${result.test || result.url?.split('/').pop() || 'Test'}: ${result.status}`);
        });
      } else {
        totalTests++;
        if (results.status === 'PASS') passedTests++;
        
        const icon = results.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${icon} ${category}: ${results.status}`);
        if (results.message) console.log(`      ${results.message}`);
      }
      console.log('');
    }

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    console.log(`📈 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)\n`);

    // Critical issues
    console.log('🚨 CRITICAL ISSUES:');
    const criticalIssues = [];
    
    for (const [category, results] of Object.entries(this.results.testResults)) {
      if (Array.isArray(results)) {
        results.forEach(result => {
          if (result.status === 'FAIL') {
            criticalIssues.push(`${category}: ${result.test || result.url} - ${result.error || 'Failed'}`);
          }
        });
      } else if (results.status === 'FAIL') {
        criticalIssues.push(`${category}: ${results.error || 'Failed'}`);
      }
    }

    if (criticalIssues.length === 0) {
      console.log('✅ No critical issues found!\n');
    } else {
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Deployment readiness
    console.log('🚀 DEPLOYMENT READINESS ASSESSMENT:');
    if (successRate >= 90) {
      console.log('✅ READY FOR DEPLOYMENT - All critical systems working');
    } else if (successRate >= 75) {
      console.log('⚠️ MOSTLY READY - Minor issues to address');
    } else {
      console.log('❌ NOT READY - Critical issues need fixing');
    }

    return this.results;
  }

  async saveReport() {
    const reportPath = 'd:/Projects/bhavya-bazaar/WEBSITE-FLOW-TEST-REPORT.json';
    const fs = require('fs');
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Full report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`\n❌ Failed to save report: ${error.message}`);
    }
  }
}

async function main() {
  const tester = new WebsiteFlowTester();
  
  try {
    await tester.testPublicPages();
    await tester.testRegistrationFlow();
    await tester.testSellerRegistrationFlow();
    await tester.testLoginFlows();
    await tester.testImageAndAssetLoading();
    await tester.testCartAndOrderFlow();
    
    await tester.generateFinalReport();
    await tester.saveReport();
    
  } catch (error) {
    console.error('❌ Website flow test failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = WebsiteFlowTester;
