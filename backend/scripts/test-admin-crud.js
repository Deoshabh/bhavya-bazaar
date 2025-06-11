/**
 * Comprehensive Admin CRUD API Test Script
 * Tests all the newly implemented admin management endpoints
 */

// Import fetch for Node.js (using dynamic import)
let fetch;
async function loadFetch() {
  if (!fetch) {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
  }
  return fetch;
}

const API_BASE = 'https://bhavyabazaar.com/api/auth';

// Test data
const TEST_ADMIN = {
  name: "Test Admin",
  email: "testadmin@bhavyabazaar.com", 
  password: "TestAdmin@2024!",
  role: "admin",
  permissions: ["manage_users", "manage_sellers", "manage_products"]
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const fetchFn = await loadFetch();
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  if (requestOptions.body && typeof requestOptions.body === 'object') {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  log(`📡 ${requestOptions.method} ${url}`, 'blue');
  
  try {
    const response = await fetchFn(url, requestOptions);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ Success (${response.status}): ${data.message || 'OK'}`, 'green');
      return { success: true, data, status: response.status };
    } else {
      log(`❌ Failed (${response.status}): ${data.message || 'Unknown error'}`, 'red');
      return { success: false, error: data.message, status: response.status };
    }
  } catch (error) {
    log(`💥 Network Error: ${error.message}`, 'red');
    return { success: false, error: error.message, status: 0 };
  }
}

// Test functions
async function testSystemStatus() {
  log('\n🔍 Testing Admin System Status...', 'yellow');
  const result = await apiRequest('/admin/system-status');
  
  if (result.success) {
    const { adminCount, superAdminCount, totalAdmins, limits } = result.data;
    log(`📊 Current Status:`, 'blue');
    log(`   - Regular Admins: ${adminCount}/${limits.maxAdmins}`);
    log(`   - Super Admins: ${superAdminCount}/${limits.maxSuperAdmins}`);
    log(`   - Total Admins: ${totalAdmins}`);
  }
  
  return result;
}

async function testEmergencySetup() {
  log('\n🚨 Testing Emergency Admin Setup...', 'yellow');
  const result = await apiRequest('/emergency-admin-setup', {
    method: 'POST',
    body: {
      emergencyKey: "EMERGENCY_ADMIN_BHAVYA_2024"
    }
  });
  
  if (result.success) {
    log(`🔑 Emergency Admin Credentials:`, 'green');
    log(`   Email: ${result.data.adminCredentials.email}`);
    log(`   Password: ${result.data.adminCredentials.password}`);
  }
  
  return result;
}

async function testAdminLogin(email, password) {
  log('\n🔐 Testing Admin Login...', 'yellow');
  const result = await apiRequest('/login-admin', {
    method: 'POST',
    body: {
      email,
      password,
      adminSecretKey: process.env.ADMIN_SECRET_KEY || "bhavya_admin_secret_2024"
    }
  });
  
  if (result.success) {
    log(`👑 Login successful for: ${result.data.admin.name} (${result.data.admin.role})`, 'green');
    return result.data.admin;
  }
  
  return null;
}

async function testCreateAdmin(adminData) {
  log('\n➕ Testing Admin Creation...', 'yellow');
  const result = await apiRequest('/admin/create', {
    method: 'POST',
    body: adminData
  });
  
  if (result.success) {
    log(`👤 Created admin: ${result.data.admin.name} (${result.data.admin.role})`, 'green');
    return result.data.admin;
  }
  
  return null;
}

async function testListAdmins() {
  log('\n📋 Testing Admin List...', 'yellow');
  const result = await apiRequest('/admin/list?page=1&limit=10');
  
  if (result.success) {
    const { admins, pagination, summary } = result.data;
    log(`📊 Found ${summary.totalAdmins} admins:`, 'green');
    admins.forEach(admin => {
      log(`   - ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'Active' : 'Inactive'}`);
    });
  }
  
  return result;
}

async function testGetAdminDetails(adminId) {
  log(`\n👤 Testing Get Admin Details for ID: ${adminId}...`, 'yellow');
  const result = await apiRequest(`/admin/${adminId}`);
  
  if (result.success) {
    const admin = result.data.admin;
    log(`📋 Admin Details:`, 'green');
    log(`   Name: ${admin.name}`);
    log(`   Email: ${admin.email}`);
    log(`   Role: ${admin.role}`);
    log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    log(`   Permissions: ${admin.permissions.join(', ')}`);
  }
  
  return result;
}

async function testUpdateAdmin(adminId, updateData) {
  log(`\n✏️ Testing Admin Update for ID: ${adminId}...`, 'yellow');
  const result = await apiRequest(`/admin/${adminId}`, {
    method: 'PUT',
    body: updateData
  });
  
  if (result.success) {
    log(`✅ Updated admin: ${result.data.admin.name}`, 'green');
  }
  
  return result;
}

async function testResetPassword(adminId, newPassword) {
  log(`\n🔑 Testing Password Reset for ID: ${adminId}...`, 'yellow');
  const result = await apiRequest(`/admin/${adminId}/reset-password`, {
    method: 'PUT',
    body: { 
      newPassword,
      forcePasswordChange: true 
    }
  });
  
  if (result.success) {
    log(`🔒 Password reset for: ${result.data.adminName}`, 'green');
  }
  
  return result;
}

async function testDeactivateAdmin(adminId) {
  log(`\n🚫 Testing Admin Deactivation for ID: ${adminId}...`, 'yellow');
  const result = await apiRequest(`/admin/${adminId}`, {
    method: 'DELETE'
  });
  
  if (result.success) {
    log(`❌ Deactivated admin: ${result.data.admin.name}`, 'green');
  }
  
  return result;
}

async function testRestoreAdmin(adminId) {
  log(`\n🔄 Testing Admin Restoration for ID: ${adminId}...`, 'yellow');
  const result = await apiRequest(`/admin/${adminId}/restore`, {
    method: 'PUT'
  });
  
  if (result.success) {
    log(`✅ Restored admin: ${result.data.admin.name}`, 'green');
  }
  
  return result;
}

// Main test runner
async function runAdminCRUDTests() {
  log('🚀 Starting Comprehensive Admin CRUD API Tests', 'blue');
  log('=' * 60, 'blue');
  
  let createdAdminId = null;
  
  try {
    // 1. Test System Status
    await testSystemStatus();
    
    // 2. Test Emergency Setup (if no admins exist)
    const emergencyResult = await testEmergencySetup();
    
    // 3. Test Admin Login
    let superAdmin = null;
    if (emergencyResult.success) {
      superAdmin = await testAdminLogin(
        emergencyResult.data.adminCredentials.email,
        emergencyResult.data.adminCredentials.password
      );
    }
    
    // 4. Test Admin Creation (requires super admin login)
    if (superAdmin) {
      const newAdmin = await testCreateAdmin(TEST_ADMIN);
      if (newAdmin) {
        createdAdminId = newAdmin.id;
      }
    }
    
    // 5. Test List Admins
    await testListAdmins();
    
    // 6. Test Get Admin Details
    if (createdAdminId) {
      await testGetAdminDetails(createdAdminId);
    }
    
    // 7. Test Update Admin
    if (createdAdminId) {
      await testUpdateAdmin(createdAdminId, {
        name: "Updated Test Admin",
        permissions: ["manage_users", "view_analytics"]
      });
    }
    
    // 8. Test Password Reset
    if (createdAdminId) {
      await testResetPassword(createdAdminId, "NewPassword@2024!");
    }
    
    // 9. Test Deactivate Admin
    if (createdAdminId) {
      await testDeactivateAdmin(createdAdminId);
    }
    
    // 10. Test Restore Admin
    if (createdAdminId) {
      await testRestoreAdmin(createdAdminId);
    }
    
    // Final status check
    log('\n🏁 Final System Status:', 'yellow');
    await testSystemStatus();
    
    log('\n🎉 All Admin CRUD Tests Completed!', 'green');
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'red');
  }
}

// Run tests if called directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAdminCRUDTests();
} else {
  // Browser environment
  window.runAdminCRUDTests = runAdminCRUDTests;
  log('🌐 Admin CRUD test suite loaded in browser. Call runAdminCRUDTests() to start tests.', 'blue');
}
