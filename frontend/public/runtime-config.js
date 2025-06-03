// Runtime configuration for deployment environments like Coolify
// This file can be dynamically updated during deployment
window.runtimeConfig = {
  API_URL: 'https://api.bhavyabazaar.com/api/v2', // Set for bhavyabazaar.com deployment
  SOCKET_URL: 'https://api.bhavyabazaar.com', // Set for bhavyabazaar.com deployment  
  BACKEND_URL: 'https://api.bhavyabazaar.com', // Set for bhavyabazaar.com deployment
  ENV: 'production',
  DEBUG: false
};

// Helper function to detect API URL from current domain if not explicitly set
window.detectApiUrl = function() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Skip detection for localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Specific configuration for bhavyabazaar.com
  if (hostname === 'bhavyabazaar.com' || hostname === 'www.bhavyabazaar.com') {
    return 'https://api.bhavyabazaar.com/api/v2';
  }
  
  // Common Coolify patterns for other deployments
  const patterns = [
    // If frontend is frontend-app.domain.com, backend might be backend-app.domain.com
    () => {
      if (hostname.startsWith('frontend-') || hostname.startsWith('app-')) {
        return `${protocol}//backend-${hostname.substring(hostname.indexOf('-') + 1)}/api/v2`;
      }
      return null;
    },
    // If frontend is subdomain.domain.com, backend might be api-subdomain.domain.com
    () => {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        const domain = parts.slice(1).join('.');
        return `${protocol}//api-${subdomain}.${domain}/api/v2`;
      }
      return null;
    },
    // If frontend is app.domain.com, backend might be api.domain.com
    () => {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const domain = parts.slice(1).join('.');
        return `${protocol}//api.${domain}/api/v2`;
      }
      return null;
    },
    // If frontend is domain.com, backend might be api.domain.com
    () => {
      return `${protocol}//api.${hostname}/api/v2`;
    }
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    const result = pattern();
    if (result) {
      console.log(`Auto-detected API URL: ${result}`);
      return result;
    }
  }
  
  return null;
};

// Auto-detect if not explicitly configured or if it's the default bhavyabazaar.com setup
if (!window.runtimeConfig.API_URL || window.runtimeConfig.API_URL === 'https://api.bhavyabazaar.com/api/v2') {
  const detectedUrl = window.detectApiUrl();
  if (detectedUrl && detectedUrl !== 'https://api.bhavyabazaar.com/api/v2') {
    window.runtimeConfig.API_URL = detectedUrl;
    window.runtimeConfig.SOCKET_URL = detectedUrl.replace('/api/v2', '');
    window.runtimeConfig.BACKEND_URL = detectedUrl.replace('/api/v2', '');
  }
}

console.log('Runtime config loaded for bhavyabazaar.com:', window.runtimeConfig);
