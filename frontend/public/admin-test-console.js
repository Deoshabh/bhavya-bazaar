/**
 * Browser Console Admin Test Script
 * Run this in the browser console on bhavyabazaar.com
 */

// Test Admin System Status
async function testAdminSystemStatus() {
  console.log('🔍 Testing Admin System Status...');
  
  try {
    const response = await fetch('/api/auth/admin/system-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 Admin System Status:', data);
    
    if (data.success) {
      console.log(`📈 Current Admin Counts:`);
      console.log(`   - Regular Admins: ${data.adminCount}/${data.limits.maxAdmins}`);
      console.log(`   - Super Admins: ${data.superAdminCount}/${data.limits.maxSuperAdmins}`);
      console.log(`   - Total Admins: ${data.totalAdmins}`);
      
      if (data.admins && data.admins.length > 0) {
        console.log('👥 Existing Admins:');
        data.admins.forEach(admin => {
          console.log(`   - ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'Active' : 'Inactive'}`);
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing admin system status:', error);
    return null;
  }
}

// Test Emergency Admin Setup
async function testEmergencyAdminSetup() {
  console.log('\n🚨 Testing Emergency Admin Setup...');
  
  try {
    const response = await fetch('/api/auth/emergency-admin-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emergencyKey: "EMERGENCY_ADMIN_BHAVYA_2024"
      })
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 Emergency Setup Response:', data);
    
    if (data.success) {
      console.log('🔑 Emergency Admin Credentials Created:');
      console.log(`   Email: ${data.adminCredentials.email}`);
      console.log(`   Password: ${data.adminCredentials.password}`);
      console.log(`   Role: ${data.adminCredentials.role}`);
      console.log('⚠️ Note: Please change password after first login');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing emergency admin setup:', error);
    return null;
  }
}

// Test Admin Login
async function testAdminLogin(email = "superadmin@bhavyabazaar.com", password = "SuperAdmin@2024!") {
  console.log('\n🔐 Testing Admin Login...');
  
  try {
    const response = await fetch('/api/auth/login-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        adminSecretKey: "bhavya_admin_secret_2024" // Default key - update if different
      })
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 Login Response:', data);
    
    if (data.success) {
      console.log('👑 Admin Login Successful:');
      console.log(`   Name: ${data.admin.name}`);
      console.log(`   Email: ${data.admin.email}`);
      console.log(`   Role: ${data.admin.role}`);
      console.log(`   Permissions: ${data.admin.permissions.join(', ')}`);
      
      // Store admin info for further testing
      window.currentAdmin = data.admin;
      console.log('💾 Admin info stored in window.currentAdmin for further testing');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing admin login:', error);
    return null;
  }
}

// Test Admin Access Check
async function testAdminAccessCheck() {
  console.log('\n🔍 Testing Admin Access Check...');
  
  try {
    const response = await fetch('/api/auth/admin/check-access', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 Access Check Response:', data);
    
    if (data.success) {
      console.log('🔐 Current Session Status:');
      console.log(`   Is Admin: ${data.isAdmin}`);
      console.log(`   Is Super Admin: ${data.isSuperAdmin}`);
      console.log(`   Can Access Admin: ${data.canAccessAdmin}`);
      if (data.adminRole) {
        console.log(`   Admin Role: ${data.adminRole}`);
        console.log(`   Permissions: ${data.permissions.join(', ')}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing admin access check:', error);
    return null;
  }
}

// Test Create New Admin (requires super admin session)
async function testCreateAdmin(adminData = {
  name: "Test Admin",
  email: "testadmin@bhavyabazaar.com",
  password: "TestAdmin@2024!",
  role: "admin",
  permissions: ["manage_users", "manage_sellers", "manage_products"]
}) {
  console.log('\n➕ Testing Create New Admin...');
  
  try {
    const response = await fetch('/api/auth/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 Create Admin Response:', data);
    
    if (data.success) {
      console.log('👤 New Admin Created:');
      console.log(`   Name: ${data.admin.name}`);
      console.log(`   Email: ${data.admin.email}`);
      console.log(`   Role: ${data.admin.role}`);
      console.log(`   Permissions: ${data.admin.permissions.join(', ')}`);
      console.log(`   Active: ${data.admin.isActive}`);
      
      // Store created admin info
      window.testAdmin = data.admin;
      console.log('💾 Created admin info stored in window.testAdmin');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing create admin:', error);
    return null;
  }
}

// Test List Admins
async function testListAdmins() {
  console.log('\n📋 Testing List Admins...');
  
  try {
    const response = await fetch('/api/auth/admin/list?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Status Code:', response.status);
    console.log('📊 List Admins Response:', data);
    
    if (data.success) {
      console.log('📊 Admin Summary:');
      console.log(`   Total Admins: ${data.data.summary.totalAdmins}`);
      console.log(`   Active Admins: ${data.data.summary.activeAdmins}`);
      console.log(`   Inactive Admins: ${data.data.summary.inactiveAdmins}`);
      
      console.log('👥 Admin List:');
      data.data.admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'Active' : 'Inactive'}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing list admins:', error);
    return null;
  }
}

// Run comprehensive admin test suite
async function runFullAdminTests() {
  console.log('🚀 Starting Comprehensive Admin CRUD Tests');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check current system status
    await testAdminSystemStatus();
    
    // 2. Test emergency setup (will fail if admins already exist)
    await testEmergencyAdminSetup();
    
    // 3. Test admin login
    await testAdminLogin();
    
    // 4. Check current session access
    await testAdminAccessCheck();
    
    // 5. Test create new admin (requires super admin session)
    await testCreateAdmin();
    
    // 6. List all admins
    await testListAdmins();
    
    console.log('\n🎉 All tests completed!');
    console.log('💡 Use individual test functions for specific testing:');
    console.log('   - testAdminSystemStatus()');
    console.log('   - testEmergencyAdminSetup()');
    console.log('   - testAdminLogin()');
    console.log('   - testAdminAccessCheck()');
    console.log('   - testCreateAdmin()');
    console.log('   - testListAdmins()');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

// Make functions available globally
window.testAdminSystemStatus = testAdminSystemStatus;
window.testEmergencyAdminSetup = testEmergencyAdminSetup;
window.testAdminLogin = testAdminLogin;
window.testAdminAccessCheck = testAdminAccessCheck;
window.testCreateAdmin = testCreateAdmin;
window.testListAdmins = testListAdmins;
window.runFullAdminTests = runFullAdminTests;

console.log('🔧 Admin Test Suite Loaded!');
console.log('📋 Available Commands:');
console.log('   runFullAdminTests() - Run all tests');
console.log('   testAdminSystemStatus() - Check admin system status');
console.log('   testEmergencyAdminSetup() - Test emergency admin creation');
console.log('   testAdminLogin() - Test admin login');
console.log('   testAdminAccessCheck() - Check current session admin access');
console.log('   testCreateAdmin() - Test creating new admin');
console.log('   testListAdmins() - Test listing all admins');
console.log('\n💡 Copy and paste this entire script into the browser console on bhavyabazaar.com');
console.log('🚀 Then run: runFullAdminTests()');
