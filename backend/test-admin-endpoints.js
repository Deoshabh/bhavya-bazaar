const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Dashboard Endpoints\n');
  
  try {
    // Step 1: Test admin login
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login-admin`, {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful');
    console.log(`Admin: ${loginResponse.data.admin.name} (${loginResponse.data.admin.role})\n`);
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'] || [];
    const cookieString = cookies.join('; ');
    
    // Step 2: Test change password endpoint
    console.log('2️⃣ Testing Change Password Endpoint...');
    try {
      const passwordResponse = await axios.put(`${BASE_URL}/api/auth/admin/change-password`, {
        currentPassword: 'SuperAdmin@2024!',
        newPassword: 'SuperAdmin@2024!'  // Same password for testing
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString
        }
      });
      
      console.log('✅ Change password endpoint working');
      console.log(`Response: ${passwordResponse.data.message}\n`);
    } catch (error) {
      console.log('❌ Change password endpoint failed');
      console.log(`Error: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Step 3: Test update profile endpoint
    console.log('3️⃣ Testing Update Profile Endpoint...');
    try {
      const profileResponse = await axios.put(`${BASE_URL}/api/auth/admin/update-profile`, {
        name: 'Super Administrator',
        email: 'superadmin@bhavyabazaar.com'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieString
        }
      });
      
      console.log('✅ Update profile endpoint working');
      console.log(`Response: ${profileResponse.data.message}\n`);
    } catch (error) {
      console.log('❌ Update profile endpoint failed');
      console.log(`Error: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Step 4: Test admin access check
    console.log('4️⃣ Testing Admin Access Check...');
    try {
      const accessResponse = await axios.get(`${BASE_URL}/api/auth/admin/check-access`, {
        headers: {
          'Cookie': cookieString
        }
      });
      
      console.log('✅ Admin access check working');
      console.log(`Is Admin: ${accessResponse.data.isAdmin}`);
      console.log(`Is Super Admin: ${accessResponse.data.isSuperAdmin}`);
      console.log(`Can Access Admin: ${accessResponse.data.canAccessAdmin}\n`);
    } catch (error) {
      console.log('❌ Admin access check failed');
      console.log(`Error: ${error.response?.data?.message || error.message}\n`);
    }
    
    // Step 5: Test admin list endpoint
    console.log('5️⃣ Testing Admin List Endpoint...');
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/auth/admin/list`, {
        headers: {
          'Cookie': cookieString
        }
      });
      
      console.log('✅ Admin list endpoint working');
      console.log(`Total Admins: ${listResponse.data.data.admins.length}`);
      console.log(`Pagination: Page ${listResponse.data.data.pagination.currentPage} of ${listResponse.data.data.pagination.totalPages}\n`);
    } catch (error) {
      console.log('❌ Admin list endpoint failed');
      console.log(`Error: ${error.response?.data?.message || error.message}\n`);
    }
    
    console.log('🎉 Admin endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Failed to test admin endpoints');
    console.error(`Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.status === 401) {
      console.error('This might be an authentication issue. Check admin credentials.');
    }
  }
}

// Run the test
testAdminEndpoints()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });
