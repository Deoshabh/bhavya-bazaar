const axios = require('axios');

async function testAdminLoginWithoutSecretKey() {
  try {
    console.log('🔐 Testing Admin Login WITHOUT Secret Key...');
    
    const response = await axios.post('https://api.bhavyabazaar.com/api/auth/login-admin', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!'
      // No adminSecretKey required anymore!
    }, {
      timeout: 10000,
      withCredentials: true
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', response.data);
    
    if (response.data.success) {
      console.log('👑 Admin Login Successful!');
      console.log(`   Name: ${response.data.admin.name}`);
      console.log(`   Email: ${response.data.admin.email}`);
      console.log(`   Role: ${response.data.admin.role}`);
      console.log(`   Permissions: ${response.data.admin.permissions.length} permissions`);
    }
    
  } catch (error) {
    console.error('❌ Admin Login Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Message:', error.response.data?.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAdminLoginWithoutSecretKey();
