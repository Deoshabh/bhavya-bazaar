#!/usr/bin/env node
/**
 * TEST ADMIN DASHBOARD REDIRECT
 * Tests the complete admin login and redirect flow
 */

const axios = require('axios');

async function testAdminLoginAndRedirect() {
  try {
    console.log('🔐 Testing Complete Admin Login and Redirect Flow...\n');
    
    // Step 1: Test login API
    console.log('📋 Step 1: Testing Admin Login API');
    const loginResponse = await axios.post('https://api.bhavyabazaar.com/api/auth/login-admin', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!'
    }, {
      timeout: 10000,
      withCredentials: true
    });
    
    console.log('✅ Login API Status:', loginResponse.status);
    console.log('📊 Login Response:', {
      success: loginResponse.data.success,
      userType: loginResponse.data.userType,
      adminRole: loginResponse.data.admin?.role,
      adminName: loginResponse.data.admin?.name
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed!');
      return;
    }
    
    // Step 2: Extract session cookies
    console.log('\n📋 Step 2: Checking Session Cookies');
    const cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Cookies set:', cookies ? 'YES' : 'NO');
    
    // Step 3: Test admin access check
    console.log('\n📋 Step 3: Testing Admin Access Check');
    const accessCheckResponse = await axios.get('https://api.bhavyabazaar.com/api/auth/admin/check-access', {
      withCredentials: true,
      timeout: 5000,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    console.log('✅ Access Check Status:', accessCheckResponse.status);
    console.log('📊 Access Check Response:', {
      success: accessCheckResponse.data.success,
      isAdmin: accessCheckResponse.data.isAdmin,
      isSuperAdmin: accessCheckResponse.data.isSuperAdmin,
      canAccessAdmin: accessCheckResponse.data.canAccessAdmin,
      adminRole: accessCheckResponse.data.adminRole
    });
    
    // Step 4: Summary
    console.log('\n🔷 FLOW ANALYSIS');
    console.log('='.repeat(50));
    
    const loginSuccess = loginResponse.data.success;
    const correctRole = ['admin', 'superadmin'].includes(loginResponse.data.admin?.role?.toLowerCase());
    const accessGranted = accessCheckResponse.data.canAccessAdmin;
    
    console.log(`✅ Login API Success: ${loginSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Admin Role Check: ${correctRole ? 'PASS' : 'FAIL'} (${loginResponse.data.admin?.role})`);
    console.log(`✅ Admin Access Check: ${accessGranted ? 'PASS' : 'FAIL'}`);
    
    if (loginSuccess && correctRole && accessGranted) {
      console.log('\n🎉 ALL CHECKS PASSED! Admin should be able to access dashboard.');
      console.log('🌐 Frontend Route Guards should now accept:');
      console.log(`   - user.role: "${loginResponse.data.admin?.role}"`);
      console.log('   - Requirements: ["admin", "superadmin"].includes(user.role?.toLowerCase())');
      console.log('   - Result: ALLOWED ✅');
    } else {
      console.log('\n⚠️  SOME CHECKS FAILED. Please review the issues above.');
    }
    
  } catch (error) {
    console.error('❌ Test Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAdminLoginAndRedirect();
