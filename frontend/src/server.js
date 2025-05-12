// Backend URLs configuration with environment variables support
const getApiDomain = () => {
  const url = process.env.REACT_APP_API_URL;
  if (!url) {
    // In production, use HTTPS, in development use HTTP
    return process.env.NODE_ENV === 'production' 
      ? 'https://api.bhavyabazaar.com/api/v2'
      : 'http://localhost:8000/api/v2';
  }

  // For production environment, ensure HTTPS
  if (process.env.NODE_ENV === 'production') {
    // Remove any trailing slashes and add /api/v2
    const baseUrl = url.replace(/\/$/, '');
    return baseUrl.replace(/^http:/, 'https:') + '/api/v2';
  }

  return url;
};

const getWebsocketUrl = () => {
  const wsUrl = process.env.REACT_APP_WS_URL;
  const defaultProdWs = 'wss://socket.bhavyabazaar.com';
  const defaultDevWs = 'ws://localhost:3003';

  if (!wsUrl) {
    return process.env.NODE_ENV === 'production' ? defaultProdWs : defaultDevWs;
  }

  // Force WSS in production
  return process.env.NODE_ENV === 'production'
    ? wsUrl.replace(/^ws:/, 'wss:')
    : wsUrl;
};

const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL;
  const defaultProdUrl = 'https://api.bhavyabazaar.com';
  const defaultDevUrl = 'http://localhost:8000';

  if (!url) {
    return process.env.NODE_ENV === 'production' ? defaultProdUrl : defaultDevUrl;
  }

  // Force HTTPS in production
  return process.env.NODE_ENV === 'production'
    ? url.replace(/^http:/, 'https:')
    : url;
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
