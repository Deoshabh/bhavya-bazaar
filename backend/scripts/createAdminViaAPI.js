const https = require('https');
const fs = require('fs');

console.log('🚀 Creating Admin User via Production API');
console.log('==========================================\n');

// Function to make HTTP requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Step 1: Check if admin user already exists by trying to login
async function checkExistingAdmin() {
  console.log('🔍 Checking if admin user already exists...');
  
  const loginData = JSON.stringify({
    phoneNumber: '1234567890',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'api.bhavyabazaar.com',
    port: 443,
    path: '/api/v2/user/login-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  try {
    const result = await makeRequest(options, loginData);
    
    if (result.data.success) {
      console.log('✅ Admin user already exists and login works!');
      console.log('📋 Admin details found:', {
        phoneNumber: '1234567890',
        password: 'admin123'
      });
      return true;
    } else {
      console.log('❌ Admin login failed:', result.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking admin login:', error.message);
    return false;
  }
}

// Step 2: Create admin user via API
async function createAdminUser() {
  console.log('\n👤 Creating admin user via production API...');
  
  const userData = JSON.stringify({
    name: 'Super Admin',
    phoneNumber: '1234567890',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'api.bhavyabazaar.com',
    port: 443,
    path: '/api/v2/user/create-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': userData.length
    }
  };
  
  try {
    const result = await makeRequest(options, userData);
    
    console.log(`📥 Response Status: ${result.statusCode}`);
    console.log('📥 Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.data.success) {
      console.log('✅ Admin user created successfully via API!');
      return result.data.user;
    } else {
      console.log('❌ Failed to create admin user:', result.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating admin user:', error.message);
    return null;
  }
}

// Step 3: Update user role to admin (if created as regular user)
async function updateUserToAdmin(userId) {
  console.log('\n🔄 Attempting to update user role to admin...');
  console.log('⚠️  Note: This requires admin privileges, so it may fail');
  
  // This would require being authenticated as an admin, which we can't do
  // without already having an admin user. This is a chicken-and-egg problem.
  console.log('❌ Cannot update user role without admin authentication');
  console.log('💡 Need to update database directly or modify backend code temporarily');
  
  return false;
}

// Step 4: Test admin login after creation
async function testAdminLogin() {
  console.log('\n🔐 Testing admin login after creation...');
  
  const loginData = JSON.stringify({
    phoneNumber: '1234567890',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'api.bhavyabazaar.com',
    port: 443,
    path: '/api/v2/user/login-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  try {
    const result = await makeRequest(options, loginData);
    
    console.log(`📥 Login Response Status: ${result.statusCode}`);
    console.log('📥 Login Response Data:', JSON.stringify(result.data, null, 2));
    
    if (result.data.success) {
      console.log('✅ Admin login successful!');
      
      // Check if user has admin role
      if (result.data.user && result.data.user.role === 'Admin') {
        console.log('🎉 User has Admin role - setup complete!');
        return true;
      } else {
        console.log('⚠️  User created but does not have Admin role');
        console.log('📋 User role:', result.data.user?.role || 'undefined');
        return false;
      }
    } else {
      console.log('❌ Admin login failed:', result.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing admin login:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Check if admin already exists
    const adminExists = await checkExistingAdmin();
    
    if (adminExists) {
      console.log('\n🎉 Admin user setup is already complete!');
      console.log('🔗 You can login at: https://bhavyabazaar.com/admin-login');
      console.log('📞 Phone: 1234567890');
      console.log('🔑 Password: admin123');
      return;
    }
    
    // Try to create admin user
    const createdUser = await createAdminUser();
    
    if (createdUser) {
      // Test login
      const loginSuccess = await testAdminLogin();
      
      if (loginSuccess) {
        console.log('\n🎉 Admin user setup completed successfully!');
        console.log('🔗 Login URL: https://bhavyabazaar.com/admin-login');
        console.log('📞 Phone: 1234567890');
        console.log('🔑 Password: admin123');
      } else {
        console.log('\n⚠️  Admin user created but needs role update');
        console.log('💡 The user was created as a regular user, not admin');
        console.log('🔧 You may need to manually update the user role in the database');
      }
    } else {
      console.log('\n❌ Failed to create admin user');
      console.log('💡 Try creating a regular user first, then manually updating the role');
    }
    
  } catch (error) {
    console.error('\n💥 Script execution failed:', error.message);
  }
}

// Run the script
main();
