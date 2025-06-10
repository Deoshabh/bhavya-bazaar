#!/usr/bin/env node

/**
 * COMPREHENSIVE AUTHENTICATION SYSTEM TESTER
 * Tests all 4 user types and their authentication flows:
 * - Customer/User: Phone + Password
 * - Seller: Phone + Password
 * - Admin: Email + Password + Admin Key  
 * - Super Admin: Email + Password + Super Admin Key
 */

const axios = require('axios');
require('dotenv').config();

// Colors for terminal output
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

class AuthenticationTester {
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

      // Add cookies if available
      if (options.cookies || this.sessionCookies[options.userType]) {
        config.headers.Cookie = options.cookies || this.sessionCookies[options.userType];
      }

      const startTime = Date.now();
      const response = await axios(config);
      const duration = Date.now() - startTime;

      // Store cookies for session management
      if (response.headers['set-cookie'] && options.userType) {
        this.sessionCookies[options.userType] = response.headers['set-cookie'].join('; ');
      }

      return {
        success: true,
        status: response.status,
        data: response.data,
        duration,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message,
        duration: 0,
        isNetworkError: !error.response
      };
    }
  }

  async testCustomerAuthentication() {
    log.header('TESTING CUSTOMER AUTHENTICATION');
    
    const timestamp = Date.now();
    const phoneNumber = `999${timestamp.toString().slice(-7)}`;
    
    // Test customer registration
    log.info('Testing customer registration...');
    const registerResult = await this.makeRequest('/api/auth/register-user', 'POST', {
      name: `Test Customer ${timestamp}`,
      phoneNumber: phoneNumber,
      password: 'TestPass123!',
    });

    if (registerResult.success) {
      log.success(`Customer registration successful - Phone: ${phoneNumber}`);
    } else {
      log.error(`Customer registration failed: ${registerResult.error?.message || registerResult.error}`);
      return false;
    }

    // Test customer login
    log.info('Testing customer login...');
    const loginResult = await this.makeRequest('/api/auth/login-user', 'POST', {
      phoneNumber: phoneNumber,
      password: 'TestPass123!',
    }, { userType: 'customer' });

    if (loginResult.success) {
      log.success(`Customer login successful`);
      return true;
    } else {
      log.error(`Customer login failed: ${loginResult.error?.message || loginResult.error}`);
      return false;
    }
  }

  async testSellerAuthentication() {
    log.header('TESTING SELLER AUTHENTICATION');
    
    const timestamp = Date.now();
    const phoneNumber = `888${timestamp.toString().slice(-7)}`;
    
    // Test seller registration
    log.info('Testing seller registration...');
    const registerResult = await this.makeRequest('/api/auth/register-seller', 'POST', {
      name: `Test Shop ${timestamp}`,
      phoneNumber: phoneNumber,
      password: 'TestPass123!',
      address: 'Test Address, Test City',
      zipCode: '123456'
    });

    if (registerResult.success) {
      log.success(`Seller registration successful - Phone: ${phoneNumber}`);
    } else {
      log.error(`Seller registration failed: ${registerResult.error?.message || registerResult.error}`);
      return false;
    }

    // Test seller login
    log.info('Testing seller login...');
    const loginResult = await this.makeRequest('/api/auth/login-seller', 'POST', {
      phoneNumber: phoneNumber,
      password: 'TestPass123!',
    }, { userType: 'seller' });

    if (loginResult.success) {
      log.success(`Seller login successful`);
      return true;
    } else {
      log.error(`Seller login failed: ${loginResult.error?.message || loginResult.error}`);
      return false;
    }
  }

  async testAdminAuthentication() {
    log.header('TESTING ADMIN AUTHENTICATION');
    
    // Test admin login
    log.info('Testing regular admin login...');
    const loginResult = await this.makeRequest('/api/auth/login-admin', 'POST', {
      email: 'admin@bhavyabazaar.com',
      password: 'admin123456',
      adminSecretKey: process.env.ADMIN_SECRET_KEY
    }, { userType: 'admin' });

    if (loginResult.success) {
      log.success(`Admin login successful`);
      log.info(`Admin role: ${loginResult.data.admin?.role}`);
      
      // Test admin-only endpoint
      log.info('Testing admin endpoint access...');
      const adminEndpointResult = await this.makeRequest('/api/v2/user/admin-all-users', 'GET', null, {
        userType: 'admin'
      });

      if (adminEndpointResult.success) {
        log.success(`Admin endpoint access successful`);
        return true;
      } else {
        log.error(`Admin endpoint access failed: ${adminEndpointResult.error?.message || adminEndpointResult.error}`);
        return false;
      }
    } else {
      log.error(`Admin login failed: ${loginResult.error?.message || loginResult.error}`);
      return false;
    }
  }

  async testSuperAdminAuthentication() {
    log.header('TESTING SUPER ADMIN AUTHENTICATION');
    
    // Test super admin login
    log.info('Testing super admin login...');
    const loginResult = await this.makeRequest('/api/auth/login-admin', 'POST', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin123!@#',
      adminSecretKey: process.env.ADMIN_SECRET_KEY
    }, { userType: 'superadmin' });

    if (loginResult.success) {
      log.success(`Super admin login successful`);
      log.info(`Super admin role: ${loginResult.data.admin?.role}`);
      
      // Test super admin-only functionality
      log.info('Testing super admin endpoint access...');
      const superAdminEndpointResult = await this.makeRequest('/api/v2/user/admin-all-users', 'GET', null, {
        userType: 'superadmin'
      });

      if (superAdminEndpointResult.success) {
        log.success(`Super admin endpoint access successful`);
        return true;
      } else {
        log.error(`Super admin endpoint access failed: ${superAdminEndpointResult.error?.message || superAdminEndpointResult.error}`);
        return false;
      }
    } else {
      log.error(`Super admin login failed: ${loginResult.error?.message || loginResult.error}`);
      return false;
    }
  }

  async testSessionValidation() {
    log.header('TESTING SESSION VALIDATION');
    
    // Test session validation for each user type
    const userTypes = ['customer', 'seller', 'admin', 'superadmin'];
    let validSessions = 0;

    for (const userType of userTypes) {
      if (this.sessionCookies[userType]) {
        log.info(`Testing ${userType} session validation...`);
        
        const sessionResult = await this.makeRequest('/api/auth/me', 'GET', null, {
          userType: userType
        });

        if (sessionResult.success) {
          log.success(`${userType} session is valid`);
          validSessions++;
        } else {
          log.warning(`${userType} session validation failed`);
        }
      }
    }

    return validSessions;
  }

  async testLogout() {
    log.header('TESTING LOGOUT FUNCTIONALITY');
    
    // Test universal logout
    log.info('Testing universal logout...');
    const logoutResult = await this.makeRequest('/api/auth/logout', 'POST');

    if (logoutResult.success) {
      log.success('Universal logout successful');
      return true;
    } else {
      log.error(`Logout failed: ${logoutResult.error?.message || logoutResult.error}`);
      return false;
    }
  }

  async runCompleteAuthTest() {
    log.header('COMPREHENSIVE AUTHENTICATION SYSTEM TEST');
    log.info(`API URL: ${this.apiUrl}`);
    log.separator();

    const results = {
      customer: false,
      seller: false,
      admin: false,
      superAdmin: false,
      sessions: 0,
      logout: false
    };

    try {
      // Test all authentication flows
      results.customer = await this.testCustomerAuthentication();
      log.separator();
      
      results.seller = await this.testSellerAuthentication();
      log.separator();
      
      results.admin = await this.testAdminAuthentication();
      log.separator();
      
      results.superAdmin = await this.testSuperAdminAuthentication();
      log.separator();
      
      results.sessions = await this.testSessionValidation();
      log.separator();
      
      results.logout = await this.testLogout();
      log.separator();

      // Generate final report
      this.generateTestReport(results);

    } catch (error) {
      log.error(`Test suite error: ${error.message}`);
    }

    return results;
  }

  generateTestReport(results) {
    log.header('AUTHENTICATION TEST REPORT');
    
    const totalTests = 6;
    const passedTests = Object.values(results).filter(result => 
      typeof result === 'boolean' ? result : result > 0
    ).length;
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    log.info('Test Results:');
    log.info(`  👤 Customer Auth: ${results.customer ? '✅ PASS' : '❌ FAIL'}`);
    log.info(`  🏪 Seller Auth: ${results.seller ? '✅ PASS' : '❌ FAIL'}`);
    log.info(`  🛡️  Admin Auth: ${results.admin ? '✅ PASS' : '❌ FAIL'}`);
    log.info(`  👑 Super Admin Auth: ${results.superAdmin ? '✅ PASS' : '❌ FAIL'}`);
    log.info(`  🔄 Session Validation: ${results.sessions > 0 ? '✅ PASS' : '❌ FAIL'} (${results.sessions} valid)`);
    log.info(`  🚪 Logout: ${results.logout ? '✅ PASS' : '❌ FAIL'}`);
    
    log.separator();
    log.info(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
    
    if (successRate >= 80) {
      log.success('Authentication system is working well! ✨');
    } else if (successRate >= 60) {
      log.warning('Authentication system needs some fixes. 🔧');
    } else {
      log.error('Authentication system has critical issues! 🚨');
    }
  }
}

// Command line interface
async function main() {
  const tester = new AuthenticationTester();
  const args = process.argv.slice(2);

  try {
    if (args.length === 0 || args[0] === 'all') {
      await tester.runCompleteAuthTest();
    } else if (args[0] === 'customer') {
      await tester.testCustomerAuthentication();
    } else if (args[0] === 'seller') {
      await tester.testSellerAuthentication();
    } else if (args[0] === 'admin') {
      await tester.testAdminAuthentication();
    } else if (args[0] === 'super-admin') {
      await tester.testSuperAdminAuthentication();
    } else {
      console.log(`
${colors.bold}${colors.cyan}🔐 AUTHENTICATION SYSTEM TESTER${colors.reset}

${colors.bold}COMMANDS:${colors.reset}
  ${colors.green}all${colors.reset}         - Run complete authentication test (default)
  ${colors.green}customer${colors.reset}    - Test customer authentication only
  ${colors.green}seller${colors.reset}      - Test seller authentication only
  ${colors.green}admin${colors.reset}       - Test admin authentication only
  ${colors.green}super-admin${colors.reset} - Test super admin authentication only

${colors.bold}USAGE:${colors.reset}
  node test-authentication.js [command]
`);
    }
  } catch (error) {
    log.error(`Test error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AuthenticationTester;
