// Load configuration from environment variables with smart defaults
const getApiDomain = () => {
  // Check for runtime environment variables first (for Coolify deployments)
  if (window.__RUNTIME_CONFIG__?.API_URL) {
    return window.__RUNTIME_CONFIG__.API_URL;
  }
  if (window.RUNTIME_CONFIG?.API_URL) {
    return window.RUNTIME_CONFIG.API_URL;
  }
  
  // For local development - check if we're on localhost
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    return 'http://localhost:8000/api/v2';
  }
  
  // Smart default for bhavyabazaar.com deployment
  if (window.__RUNTIME_CONFIG__?.NODE_ENV === 'production' || window.RUNTIME_CONFIG?.NODE_ENV === 'production') {
    // If deployed on bhavyabazaar.com or related domains
    if (currentDomain === 'bhavyabazaar.com' || currentDomain === 'www.bhavyabazaar.com') {
      return 'https://api.bhavyabazaar.com/api/v2';
    }
    // For other custom domains, try to infer backend URL
    if (currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
      // Common Coolify patterns: if frontend is on subdomain.domain.com, backend might be on api-subdomain.domain.com
      if (currentDomain.includes('.')) {
        const parts = currentDomain.split('.');
        const baseDomain = parts.slice(-2).join('.');
        return `https://api-${parts[0]}.${baseDomain}/api/v2`;
      }
      // Or try api.domain.com
      return `https://api.${currentDomain}/api/v2`;
    }
  }
  
  // Final fallback for bhavyabazaar.com
  return 'https://api.bhavyabazaar.com/api/v2';
};

// Get base API URL without the /api/v2 suffix for manual endpoint construction
const getApiBaseUrl = () => {
  const fullUrl = getApiDomain();
  return fullUrl.replace('/api/v2', '');
};

const getBackendUrl = () => {
  // Check for runtime environment variables first
  if (window.RUNTIME_CONFIG?.BACKEND_URL) {
    const url = window.RUNTIME_CONFIG.BACKEND_URL;
    return url.endsWith('/') ? url : `${url}/`;
  }
  
  // Check for enhanced runtime config
  if (window.__RUNTIME_CONFIG__?.BACKEND_URL) {
    const url = window.__RUNTIME_CONFIG__.BACKEND_URL;
    return url.endsWith('/') ? url : `${url}/`;
  }
  
  // Fallback to API domain
  const apiUrl = getApiDomain();
  return apiUrl.replace('/api/v2', '/');
};

// Utility function to safely construct image URLs
export const getImageUrl = (filename, fallbackType = 'product') => {
  // If no filename provided, return appropriate fallback
  if (!filename) {
    const fallbacks = {
      product: '/user-placeholder.png',
      shop: '/user-placeholder.png',
      user: '/user-placeholder.png',
      laptop: '/laptop-placeholder.svg',
      shoes: '/shoes-placeholder.svg',
      cosmetics: '/cosmetics-placeholder.svg',
      gifts: '/gifts-placeholder.svg'
    };
    return fallbacks[fallbackType] || fallbacks.product;
  }
  
  // If it's already a full URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's a local static file (starts with /), return relative to frontend
  if (filename.startsWith('/')) {
    return filename;
  }
  
  // Get base URL with proper fallback chain (NO process.env for browser compatibility!)
  const baseUrl = window.__RUNTIME_CONFIG__?.BACKEND_URL || 
                  window.RUNTIME_CONFIG?.BACKEND_URL || 
                  window.__RUNTIME_CONFIG__?.API_URL?.replace('/api/v2', '') || 
                  window.RUNTIME_CONFIG?.API_URL?.replace('/api/v2', '') || 
                  'https://api.bhavyabazaar.com';
  
  // Clean up the filename (remove leading slash if any)
  const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
  
  // Ensure proper URL construction
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/uploads/${cleanFilename}`;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

// Sleep function for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Debug helper to log connection details
export const debugConnection = (url) => {
  console.log(`Connection attempt to: ${url}`);
  console.log(`Environment: ${window.__RUNTIME_CONFIG__?.NODE_ENV || window.RUNTIME_CONFIG?.NODE_ENV || 'development'}`);
  console.log(`API Domain: ${getApiDomain()}`);
  return url;
};

// Helper to get fallback URL with retry logic
export const getFallbackUrl = (url, attempt = 0) => {
  if (window.__RUNTIME_CONFIG__?.NODE_ENV === 'development' || window.RUNTIME_CONFIG?.NODE_ENV === 'development') {
    return url;
  }

  // If HTTPS fails, try HTTP as fallback
  if (url.startsWith('https://') && attempt === 0) {
    console.log('Trying HTTP fallback...');
    return url.replace('https://', 'http://');
  }

  // If both HTTPS and HTTP fail, try alternative domains
  if (attempt === 1) {
    console.log('Trying alternative domain...');
    return url.replace('api.bhavyabazaar.com', 'bhavyabazaar.com');
  }

  // Return original URL if all fallbacks fail
  return url;
};

// Async function to test connection
export const testConnection = async (url, options = {}) => {
  const { timeout = 5000, retries = MAX_RETRIES } = options;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        credentials: 'include',
        timeout
      });

      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.warn(`Connection attempt ${attempt + 1} failed:`, error.message);
    }

    if (attempt < retries - 1) {
      const delayTime = RETRY_DELAY * Math.pow(2, attempt);
      await sleep(delayTime);
    }
  }

  return false;
};

// Export configurations
export const server = getApiDomain();
export const apiBase = getApiBaseUrl(); // Base URL without /api/v2 for manual endpoint construction
export const backend_url = getBackendUrl();
