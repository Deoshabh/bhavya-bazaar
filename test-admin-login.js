const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login...');
    
    const response = await axios.post('https://api.bhavyabazaar.com/api/auth/login-admin', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!',
      adminSecretKey: 'bhavya_bazaar_admin_2025_secure_key'
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
    }
    
  } catch (error) {
    console.error('❌ Admin Login Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAdminLogin();
