/**
 * Comprehensive Shop Creation Diagnostic for Deployed Project
 * This script will identify the exact issue preventing shop creation
 */

const runDiagnostic = async () => {
  console.log('🚀 Bhavya Bazaar Shop Creation Diagnostic');
  console.log('=' .repeat(60));

  // Check 1: Runtime Configuration
  console.log('\n📋 1. Runtime Configuration Check');
  console.log('-' .repeat(30));
  
  if (window.__RUNTIME_CONFIG__) {
    console.log('✅ Runtime config found:', window.__RUNTIME_CONFIG__);
  } else if (window.RUNTIME_CONFIG) {
    console.log('✅ Legacy runtime config found:', window.RUNTIME_CONFIG);
  } else {
    console.log('❌ No runtime configuration found!');
    console.log('   This could cause API endpoint resolution issues.');
  }

  // Check 2: API Endpoint Resolution
  console.log('\n🌐 2. API Endpoint Resolution');
  console.log('-' .repeat(30));
  
  const expectedApiUrl = 'https://api.bhavyabazaar.com/api/v2';
  const actualApiUrl = window.__RUNTIME_CONFIG__?.API_URL || window.RUNTIME_CONFIG?.API_URL;
  
  console.log(`Expected API URL: ${expectedApiUrl}`);
  console.log(`Actual API URL: ${actualApiUrl}`);
  
  if (actualApiUrl === expectedApiUrl) {
    console.log('✅ API URL configuration is correct');
  } else {
    console.log('❌ API URL mismatch detected!');
  }

  // Check 3: Shop Creation Endpoint Accessibility
  console.log('\n🔗 3. Shop Creation Endpoint Test');
  console.log('-' .repeat(30));
  
  const shopCreateUrl = `${actualApiUrl || expectedApiUrl}/shop/create-shop`;
  console.log(`Testing endpoint: ${shopCreateUrl}`);
  
  try {
    // Test OPTIONS request (CORS preflight)
    const optionsResponse = await fetch(shopCreateUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`OPTIONS response status: ${optionsResponse.status}`);
    console.log('CORS headers:', Object.fromEntries([...optionsResponse.headers.entries()]));
    
    if (optionsResponse.status === 200 || optionsResponse.status === 204) {
      console.log('✅ CORS preflight successful');
    } else {
      console.log('❌ CORS preflight failed');
    }
    
  } catch (error) {
    console.log('❌ Endpoint connectivity error:', error.message);
  }

  // Check 4: Session Cookie Configuration
  console.log('\n🍪 4. Session Cookie Check');
  console.log('-' .repeat(30));
  
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log('Current cookies:', cookies);
  
  const sessionCookie = cookies.find(c => c.startsWith('connect.sid='));
  if (sessionCookie) {
    console.log('✅ Session cookie present:', sessionCookie.substring(0, 50) + '...');
  } else {
    console.log('⚠️ No session cookie found (expected for new users)');
  }

  // Check 5: Network Environment
  console.log('\n🌍 5. Network Environment');
  console.log('-' .repeat(30));
  
  console.log(`Current origin: ${window.location.origin}`);
  console.log(`Current hostname: ${window.location.hostname}`);
  console.log(`Protocol: ${window.location.protocol}`);
  console.log(`User agent: ${navigator.userAgent.substring(0, 100)}...`);

  // Check 6: Test Shop Creation Request (Simulated)
  console.log('\n🧪 6. Simulated Shop Creation Test');
  console.log('-' .repeat(30));
  
  try {
    // Create a test FormData object
    const testFormData = new FormData();
    testFormData.append('name', 'Test Shop');
    testFormData.append('phoneNumber', '1234567890');
    testFormData.append('password', 'testpass123');
    testFormData.append('address', 'Test Address');
    testFormData.append('zipCode', '123456');
    
    // Create a small test file
    const testFile = new Blob(['test'], { type: 'image/png' });
    testFormData.append('file', testFile, 'test.png');
    
    console.log('Making test shop creation request...');
    
    const response = await fetch(shopCreateUrl, {
      method: 'POST',
      body: testFormData,
      credentials: 'include',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Shop creation test successful!');
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Shop creation test failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Shop creation test error:', error.message);
  }

  // Check 7: Recommendations
  console.log('\n💡 7. Diagnostic Summary');
  console.log('-' .repeat(30));
  
  console.log('Common issues and solutions:');
  console.log('1. CORS Error → Check backend CORS origin configuration');
  console.log('2. 400 Bad Request → Check form data validation');
  console.log('3. 500 Server Error → Check backend logs and database connectivity');
  console.log('4. Network Error → Check if backend server is running');
  console.log('5. Session Issues → Check cookie domain and sameSite settings');
  
  console.log('\n📋 Next Steps:');
  console.log('- Check browser Network tab for exact error details');
  console.log('- Verify backend server logs for error messages');
  console.log('- Test with different browsers/devices');
  console.log('- Check if form validation is passing on frontend');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Diagnostic Complete!');
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  runDiagnostic().catch(console.error);
}

// Export for manual execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runDiagnostic;
}
