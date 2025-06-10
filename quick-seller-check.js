/**
 * Quick Seller Check Script
 * Quickly check if a seller exists and their login status
 */

console.log('🔍 Quick Seller Diagnosis');
console.log('Enter the phone number you\'re having issues with.');
console.log('This script will help identify the problem.');

// This can be run in the browser console or Node.js
function checkSellerStatus(phoneNumber) {
  console.log(`Checking seller status for: ${phoneNumber}`);
  
  // If running in browser, you can call the API directly
  if (typeof window !== 'undefined' && window.axios) {
    return checkSellerInBrowser(phoneNumber);
  }
  
  console.log('For Node.js environment, please run seller-diagnosis.js instead');
}

async function checkSellerInBrowser(phoneNumber) {
  try {
    console.log('🌐 Running browser-based check...');
    
    // Check if we can access the shop info endpoint
    const response = await axios.get(`/api/v2/shop/get-shop-info-by-phone/${phoneNumber}`, {
      withCredentials: true
    });
    
    if (response.data.success) {
      console.log('❌ ISSUE: Seller still exists in database');
      console.log('Seller data:', response.data.shop);
      return { exists: true, seller: response.data.shop };
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Seller not found in database (correctly deleted)');
      return { exists: false };
    } else {
      console.log('❌ Error checking seller:', error.response?.data || error.message);
      return { error: error.response?.data || error.message };
    }
  }
}

// Test registration endpoint
async function testRegistration(phoneNumber) {
  try {
    console.log('🧪 Testing if registration is blocked...');
    
    const testData = {
      name: 'Test Shop',
      phoneNumber: phoneNumber,
      password: 'testpass123',
      address: 'Test Address',
      zipCode: '123456'
    };
    
    const response = await axios.post('/api/auth/register-seller', testData, {
      withCredentials: true
    });
    
    console.log('✅ Registration would succeed');
    return { canRegister: true };
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('❌ CONFIRMED: Registration blocked due to existing seller');
      return { canRegister: false, reason: 'seller_exists' };
    } else {
      console.log('❌ Registration error:', error.response?.data?.message || error.message);
      return { canRegister: false, reason: 'other_error', error: error.response?.data };
    }
  }
}

// Test login endpoint  
async function testLogin(phoneNumber) {
  try {
    console.log('🔐 Testing login...');
    
    const loginData = {
      phoneNumber: phoneNumber,
      password: 'testpass123' // You'll need to provide the actual password
    };
    
    const response = await axios.post('/api/auth/login-seller', loginData, {
      withCredentials: true
    });
    
    console.log('✅ Login succeeded');
    return { canLogin: true, user: response.data };
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return { canLogin: false, error: error.response?.data };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.checkSellerStatus = checkSellerStatus;
  window.testRegistration = testRegistration;
  window.testLogin = testLogin;
  
  console.log('🎯 Functions available in browser console:');
  console.log('  - checkSellerStatus("1234567890")');
  console.log('  - testRegistration("1234567890")');
  console.log('  - testLogin("1234567890")');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkSellerStatus, testRegistration, testLogin };
}
