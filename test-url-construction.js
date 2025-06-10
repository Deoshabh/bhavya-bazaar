// Quick URL construction test
console.log('=== URL Construction Test ===');

// Simulate the runtime config
window = {
  __RUNTIME_CONFIG__: {
    API_URL: "https://api.bhavyabazaar.com/api/v2"
  },
  location: {
    hostname: 'bhavyabazaar.com'
  }
};

// Same logic as in Signup.jsx
const getBaseUrl = () => {
  // Priority 1: Runtime config (for production deployments)
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    const url = window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '');
    console.log('✅ Using __RUNTIME_CONFIG__ API_URL:', url);
    return url;
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    const url = window.RUNTIME_CONFIG.API_URL.replace('/api/v2', '');
    console.log('✅ Using RUNTIME_CONFIG API_URL:', url);
    return url;
  }
  
  // Priority 2: Environment detection
  const hostname = window.location.hostname;
  console.log('🌐 Detected hostname:', hostname);
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('✅ Using localhost API URL');
    return 'http://localhost:8000';
  }
  if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
    console.log('✅ Using production API URL for bhavyabazaar.com');
    return 'https://api.bhavyabazaar.com';
  }
  
  // Priority 3: Inferred API URL
  const inferredUrl = `https://api.${hostname}`;
  console.log('✅ Using inferred API URL:', inferredUrl);
  return inferredUrl;
};

const baseUrl = getBaseUrl();

// Ensure no double slashes in URL construction
const apiUrl = `${baseUrl}/api/auth/register-user`.replace(/([^:]\/)\/+/g, "$1");

console.log('🔍 Final Base URL:', baseUrl);
console.log('🔍 Final API URL:', apiUrl);
console.log('🔍 Expected API URL: https://api.bhavyabazaar.com/api/auth/register-user');
console.log('🔍 URLs match:', apiUrl === 'https://api.bhavyabazaar.com/api/auth/register-user');

// Test different scenarios
console.log('\n=== Testing different scenarios ===');

// Test with malformed config
window.__RUNTIME_CONFIG__.API_URL = ".bhavyabazaar.com/api/v2";
const badBaseUrl = getBaseUrl();
const badApiUrl = `${badBaseUrl}/api/auth/register-user`.replace(/([^:]\/)\/+/g, "$1");
console.log('🚨 With malformed config:', badApiUrl);

// Reset to correct config
window.__RUNTIME_CONFIG__.API_URL = "https://api.bhavyabazaar.com/api/v2";

console.log('\n=== Test Complete ===');
