// Load configuration from environment variables with fallbacks
const API_DOMAIN = process.env.REACT_APP_API_URL || 'https://api.bhavyabazaar.com/api';
const WEBSOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://api.bhavyabazaar.com';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.bhavyabazaar.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

// Configuration getters with retry logic
const getApiDomain = () => {
  return API_DOMAIN;
};

const getWebsocketUrl = () => {
  return WEBSOCKET_URL;
};

const getBackendUrl = () => {
  return BACKEND_URL;
};

// Sleep function for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Debug helper to log connection details
export const debugConnection = (url) => {
  console.log(`Connection attempt to: ${url}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API Domain: ${API_DOMAIN}`);
  console.log(`WebSocket URL: ${WEBSOCKET_URL}`);
  return url;
};

// Helper to get fallback URL with retry logic
export const getFallbackUrl = (url, attempt = 0) => {
  if (process.env.NODE_ENV === 'development') {
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
export const backend_url = getBackendUrl();
export const SOCKET_URL = getWebsocketUrl();
