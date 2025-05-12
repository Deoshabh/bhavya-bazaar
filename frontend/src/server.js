// Backend URLs configuration with environment variables support
const getApiDomain = () => {
  return 'https://api.bhavyabazaar.com/api/v2';
};

const getWebsocketUrl = () => {
  return 'wss://api.bhavyabazaar.com:3003';
};

const getBackendUrl = () => {
  return 'https://api.bhavyabazaar.com';
};

// Debug helper to log connection details
export const debugConnection = (url) => {
  console.log(`Connection URL: ${url}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  return url;
};

// Helper to get fallback URL (HTTP version for HTTPS URLs)
export const getFallbackUrl = (url) => {
  if (process.env.NODE_ENV === 'development') {
    return url;
  }
  return url.replace(/^https:/, 'http:');
};

export const server = getApiDomain();
export const backend_url = getBackendUrl();
export const SOCKET_URL = getWebsocketUrl();
