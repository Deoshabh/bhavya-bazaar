#!/usr/bin/env node

/**
 * COMPREHENSIVE ADMIN LOGIN FLOW TEST
 * 
 * This script tests the complete admin login flow:
 * 1. Admin login API call
 * 2. Session creation
 * 3. Authentication state verification
 * 4. Admin dashboard access
 */

const axios = require('axios');

// Console logging with colors
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  header: (msg) => console.log(`\n🔷 ${msg}\n${'='.repeat(50)}`),
};

const BASE_URL = 'https://api.bhavyabazaar.com';

class AdminLoginFlowTester {
  constructor() {
    this.cookies = '';
    this.adminData = null;
  }

  async testAdminLogin() {
    try {
      log.header('STEP 1: ADMIN LOGIN');
      log.info('Testing admin login API...');
      
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login-admin`, {
        email: 'superadmin@bhavyabazaar.com',
        password: 'SuperAdmin@2024!'
      }, {
        withCredentials: true,
        timeout: 10000
      });

      if (loginResponse.data.success) {
        log.success('Admin login successful!');
        log.info(`Admin: ${loginResponse.data.admin.name} (${loginResponse.data.admin.role})`);
        log.info(`User Type: ${loginResponse.data.userType}`);
        
        // Extract cookies for subsequent requests
        if (loginResponse.headers['set-cookie']) {
          this.cookies = loginResponse.headers['set-cookie'].join('; ');
          log.info('Session cookies captured');
        }
        
        this.adminData = loginResponse.data.admin;
        return { success: true, data: loginResponse.data };
      } else {
        log.error('Admin login failed - no success flag');
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testAuthSession() {
    try {
      log.header('STEP 2: SESSION VERIFICATION');
      log.info('Testing /api/auth/me endpoint...');
      
      const authResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Cookie': this.cookies
        },
        timeout: 10000
      });

      if (authResponse.data.success) {
        log.success('Session verification successful!');
        log.info(`Authenticated as: ${authResponse.data.user.name}`);
        log.info(`User Type: ${authResponse.data.userType}`);
        log.info(`Role: ${authResponse.data.user.role}`);
        return { success: true, data: authResponse.data };
      } else {
        log.error('Session verification failed');
        return { success: false, error: 'Session invalid' };
      }
    } catch (error) {
      log.error(`Session verification failed: ${error.response?.data?.message || error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testAdminAccess() {
    try {
      log.header('STEP 3: ADMIN ACCESS CHECK');
      log.info('Testing admin access endpoint...');
      
      const accessResponse = await axios.get(`${BASE_URL}/api/auth/admin/check-access`, {
        headers: {
          'Cookie': this.cookies
        },
        timeout: 10000
      });

      if (accessResponse.data.success) {
        log.success('Admin access check successful!');
        log.info(`Is Admin: ${accessResponse.data.isAdmin}`);
        log.info(`Is Super Admin: ${accessResponse.data.isSuperAdmin}`);
        log.info(`Can Access Admin: ${accessResponse.data.canAccessAdmin}`);
        return { success: true, data: accessResponse.data };
      } else {
        log.error('Admin access check failed');
        return { success: false, error: 'Access denied' };
      }
    } catch (error) {
      log.error(`Admin access check failed: ${error.response?.data?.message || error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testAdminDashboardData() {
    try {
      log.header('STEP 4: ADMIN DASHBOARD DATA');
      log.info('Testing admin users list endpoint...');
      
      const usersResponse = await axios.get(`${BASE_URL}/api/auth/admin/list?page=1&limit=5`, {
        headers: {
          'Cookie': this.cookies
        },
        timeout: 10000
      });

      if (usersResponse.data.success) {
        log.success('Admin dashboard data access successful!');
        log.info(`Total admins: ${usersResponse.data.data.summary.totalAdmins}`);
        log.info(`Active admins: ${usersResponse.data.data.summary.activeAdmins}`);
        return { success: true, data: usersResponse.data };
      } else {
        log.error('Admin dashboard data access failed');
        return { success: false, error: 'Dashboard access denied' };
      }
    } catch (error) {
      log.error(`Admin dashboard data access failed: ${error.response?.data?.message || error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runCompleteTest() {
    try {
      log.header('ADMIN LOGIN FLOW TEST');
      log.info('Testing complete admin authentication and access flow...');

      // Step 1: Login
      const loginResult = await this.testAdminLogin();
      if (!loginResult.success) {
        log.error('Login test failed - stopping test');
        return false;
      }

      // Step 2: Verify session
      const sessionResult = await this.testAuthSession();
      if (!sessionResult.success) {
        log.error('Session test failed - stopping test');
        return false;
      }

      // Step 3: Check admin access
      const accessResult = await this.testAdminAccess();
      if (!accessResult.success) {
        log.error('Admin access test failed - stopping test');
        return false;
      }

      // Step 4: Test dashboard data
      const dashboardResult = await this.testAdminDashboardData();
      if (!dashboardResult.success) {
        log.error('Dashboard data test failed - stopping test');
        return false;
      }

      log.header('TEST RESULTS');
      log.success('🎉 ALL TESTS PASSED!');
      log.success('✅ Admin login working correctly');
      log.success('✅ Session management working correctly');
      log.success('✅ Admin access control working correctly');
      log.success('✅ Admin dashboard access working correctly');
      
      log.info('\n📋 SUMMARY:');
      log.info(`👤 Admin: ${this.adminData.name}`);
      log.info(`🔑 Role: ${this.adminData.role}`);
      log.info(`📧 Email: ${this.adminData.email}`);
      log.info(`🛡️  Permissions: ${this.adminData.permissions.length} permissions`);
      
      return true;
    } catch (error) {
      log.error(`Test execution failed: ${error.message}`);
      return false;
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new AdminLoginFlowTester();
  tester.runCompleteTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = AdminLoginFlowTester;
