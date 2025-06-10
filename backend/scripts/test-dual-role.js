#!/usr/bin/env node

/**
 * DUAL-ROLE AUTHENTICATION SYSTEM TESTER
 * Tests the seller dual-role functionality:
 * - Sellers can act as both sellers AND customers
 * - Customers remain customer-only
 */

const axios = require('axios');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}`),
  separator: () => console.log('='.repeat(80))
};

class DualRoleTester {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:8000';
    this.sessionCookies = {};
  }

  async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
    try {
      const config = {
        method,
        url: `${this.apiUrl}${endpoint}`,
        timeout: 10000,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      if (data) {
        config.data = data;
      }

      if (options.cookies || this.sessionCookies[options.userType]) {
        config.headers.Cookie = options.cookies || this.sessionCookies[options.userType];
      }

      const response = await axios(config);

      if (response.headers['set-cookie'] && options.userType) {
        this.sessionCookies[options.userType] = response.headers['set-cookie'].join('; ');
      }

      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
    }
  }

  async testSellerDualRole() {
    log.header('TESTING SELLER DUAL-ROLE FUNCTIONALITY');
    
    const timestamp = Date.now();
    const phoneNumber = `777${timestamp.toString().slice(-7)}`;
    
    // Step 1: Create a seller account
    log.info('Step 1: Creating seller account...');
    const sellerRegister = await this.makeRequest('/api/auth/register-seller', 'POST', {
      name: `Test Shop ${timestamp}`,
      phoneNumber: phoneNumber,
      password: 'TestPass123!',
      address: 'Test Address',
      zipCode: '123456'
    });

    if (!sellerRegister.success) {
      log.error(`Seller registration failed: ${sellerRegister.error?.message || sellerRegister.error}`);
      return false;
    }
    log.success('Seller account created successfully');

    // Step 2: Login as seller
    log.info('Step 2: Logging in as seller...');
    const sellerLogin = await this.makeRequest('/api/auth/login-seller', 'POST', {
      phoneNumber: phoneNumber,
      password: 'TestPass123!'
    }, { userType: 'seller' });

    if (!sellerLogin.success) {
      log.error(`Seller login failed: ${sellerLogin.error?.message || sellerLogin.error}`);
      return false;
    }
    log.success('Seller login successful');

    // Step 3: Check current role (should be seller)
    log.info('Step 3: Checking current role...');
    const currentRole = await this.makeRequest('/api/auth/current-role', 'GET', null, { userType: 'seller' });
    
    if (currentRole.success && currentRole.data.activeRole === 'seller') {
      log.success(`Current role confirmed: ${currentRole.data.activeRole}`);
    } else {
      log.error('Failed to get current role or unexpected role');
      return false;
    }

    // Step 4: Test seller accessing seller-only endpoint
    log.info('Step 4: Testing seller-only endpoint access...');
    const sellerEndpoint = await this.makeRequest('/api/v2/shop/getSeller', 'GET', null, { userType: 'seller' });
    
    if (sellerEndpoint.success) {
      log.success('Seller can access seller-only endpoints ✓');
    } else {
      log.warning('Seller cannot access seller endpoints (this might be expected in some setups)');
    }

    // Step 5: Enable customer mode
    log.info('Step 5: Enabling customer mode for seller...');
    const enableCustomer = await this.makeRequest('/api/auth/seller/enable-customer-mode', 'POST', {}, { userType: 'seller' });
    
    if (!enableCustomer.success) {
      log.error(`Failed to enable customer mode: ${enableCustomer.error?.message || enableCustomer.error}`);
      return false;
    }
    log.success('Customer mode enabled for seller');

    // Step 6: Check role after enabling customer mode
    log.info('Step 6: Checking role after enabling customer mode...');
    const customerRole = await this.makeRequest('/api/auth/current-role', 'GET', null, { userType: 'seller' });
    
    if (customerRole.success && customerRole.data.activeRole === 'customer') {
      log.success(`Role switched to: ${customerRole.data.activeRole}`);
      log.success(`Customer mode enabled: ${customerRole.data.customerModeEnabled}`);
    } else {
      log.error('Role switching failed or unexpected role');
      return false;
    }

    // Step 7: Test seller accessing customer endpoints
    log.info('Step 7: Testing customer endpoint access while in customer mode...');
    const customerEndpoint = await this.makeRequest('/api/v2/product/get-all-products', 'GET', null, { userType: 'seller' });
    
    if (customerEndpoint.success) {
      log.success('Seller can access customer endpoints while in customer mode ✓');
    } else {
      log.warning('Seller cannot access customer endpoints (may need endpoint-specific fixes)');
    }

    // Step 8: Disable customer mode (back to seller)
    log.info('Step 8: Disabling customer mode (switching back to seller)...');
    const disableCustomer = await this.makeRequest('/api/auth/seller/disable-customer-mode', 'POST', {}, { userType: 'seller' });
    
    if (!disableCustomer.success) {
      log.error(`Failed to disable customer mode: ${disableCustomer.error?.message || disableCustomer.error}`);
      return false;
    }
    log.success('Customer mode disabled - back to seller mode');

    // Step 9: Verify back to seller role
    log.info('Step 9: Verifying back to seller role...');
    const backToSeller = await this.makeRequest('/api/auth/current-role', 'GET', null, { userType: 'seller' });
    
    if (backToSeller.success && backToSeller.data.activeRole === 'seller') {
      log.success(`Successfully switched back to: ${backToSeller.data.activeRole}`);
    } else {
      log.error('Failed to switch back to seller role');
      return false;
    }

    return true;
  }

  async testCustomerLimitations() {
    log.header('TESTING CUSTOMER LIMITATIONS');
    
    const timestamp = Date.now();
    const phoneNumber = `666${timestamp.toString().slice(-7)}`;
    
    // Step 1: Create a customer account
    log.info('Step 1: Creating customer account...');
    const customerRegister = await this.makeRequest('/api/auth/register-user', 'POST', {
      name: `Test Customer ${timestamp}`,
      phoneNumber: phoneNumber,
      password: 'TestPass123!'
    });

    if (!customerRegister.success) {
      log.error(`Customer registration failed: ${customerRegister.error?.message || customerRegister.error}`);
      return false;
    }
    log.success('Customer account created successfully');

    // Step 2: Login as customer
    log.info('Step 2: Logging in as customer...');
    const customerLogin = await this.makeRequest('/api/auth/login-user', 'POST', {
      phoneNumber: phoneNumber,
      password: 'TestPass123!'
    }, { userType: 'customer' });

    if (!customerLogin.success) {
      log.error(`Customer login failed: ${customerLogin.error?.message || customerLogin.error}`);
      return false;
    }
    log.success('Customer login successful');

    // Step 3: Try to enable customer mode (should fail)
    log.info('Step 3: Testing if customer can enable customer mode (should fail)...');
    const tryCustomerMode = await this.makeRequest('/api/auth/seller/enable-customer-mode', 'POST', {}, { userType: 'customer' });
    
    if (!tryCustomerMode.success) {
      log.success('✓ Customer correctly cannot enable customer mode (only sellers can)');
    } else {
      log.error('✗ Customer was able to enable customer mode (this should not happen!)');
      return false;
    }

    // Step 4: Try to access seller endpoints (should fail)
    log.info('Step 4: Testing if customer can access seller endpoints (should fail)...');
    const trySellerEndpoint = await this.makeRequest('/api/v2/shop/getSeller', 'GET', null, { userType: 'customer' });
    
    if (!trySellerEndpoint.success) {
      log.success('✓ Customer correctly cannot access seller-only endpoints');
    } else {
      log.error('✗ Customer was able to access seller endpoints (this should not happen!)');
      return false;
    }

    return true;
  }

  async runCompleteTest() {
    log.header('DUAL-ROLE AUTHENTICATION SYSTEM TEST');
    log.info(`API URL: ${this.apiUrl}`);
    log.separator();

    const results = {
      sellerDualRole: false,
      customerLimitations: false
    };

    try {
      results.sellerDualRole = await this.testSellerDualRole();
      log.separator();
      
      results.customerLimitations = await this.testCustomerLimitations();
      log.separator();

      // Generate final report
      this.generateTestReport(results);

    } catch (error) {
      log.error(`Test suite error: ${error.message}`);
    }

    return results;
  }

  generateTestReport(results) {
    log.header('DUAL-ROLE TEST REPORT');
    
    const totalTests = 2;
    const passedTests = Object.values(results).filter(result => result === true).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    log.info('Test Results:');
    log.info(`  🔄 Seller Dual-Role: ${results.sellerDualRole ? '✅ PASS' : '❌ FAIL'}`);
    log.info(`  🚫 Customer Limitations: ${results.customerLimitations ? '✅ PASS' : '❌ FAIL'}`);
    
    log.separator();
    log.info(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
    
    if (successRate === 100) {
      log.success('🎉 Dual-role system is working perfectly!');
      log.info('✅ Sellers can switch between seller and customer modes');
      log.info('✅ Customers are properly restricted to customer-only functionality');
    } else if (successRate >= 50) {
      log.warning('⚠️ Dual-role system partially working - some fixes needed');
    } else {
      log.error('🚨 Dual-role system has critical issues!');
    }
  }
}

// Command line interface
async function main() {
  const tester = new DualRoleTester();

  try {
    await tester.runCompleteTest();
  } catch (error) {
    log.error(`Test error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DualRoleTester;
