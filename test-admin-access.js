#!/usr/bin/env node

const axios = require("axios");

async function testAdminAccess() {
  console.log('🔍 Testing Admin Access Check...\n');
  
  try {
    // First, try to login as admin
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post('https://api.bhavyabazaar.com/api/auth/login-admin', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!'
    }, {
      withCredentials: true,
      timeout: 10000
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      console.log(`Admin: ${loginResponse.data.admin.name} (${loginResponse.data.admin.role})`);
      
      // Extract cookies for subsequent requests
      const cookies = loginResponse.headers['set-cookie'] || [];
      const cookieString = cookies.join('; ');
      
      // Now test access check
      console.log('\n2️⃣ Testing Admin Access Check...');
      const accessResponse = await axios.get('https://api.bhavyabazaar.com/api/auth/admin/check-access', {
        headers: {
          'Cookie': cookieString
        },
        timeout: 5000
      });
      
      console.log('✅ Admin access check successful');
      console.log('📊 Access Response:', JSON.stringify(accessResponse.data, null, 2));
      
      // Specifically check isSuperAdmin status
      if (accessResponse.data.isSuperAdmin) {
        console.log('\n🎯 isSuperAdmin: TRUE - Admin Management should be visible');
      } else {
        console.log('\n❌ isSuperAdmin: FALSE - Admin Management will NOT be visible');
        console.log('Admin Role:', accessResponse.data.adminRole);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testAdminAccess();
