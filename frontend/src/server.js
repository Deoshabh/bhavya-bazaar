// Backend URLs configuration with environment variables support
const SOCKET_DOMAIN = process.env.REACT_APP_SOCKET_URL || "wss://bhavyabazaar.com:4000";
const API_DOMAIN = process.env.REACT_APP_API_URL || "https://api.bhavyabazaar.com";
const FRONTEND_DOMAIN = "https://bhavyabazaar.com";

// Environment detection
export const isDevelopment = process.env.REACT_APP_ENV !== 'production';

// Protocol configuration - use secure protocols for production
const useSecureProtocol = !isDevelopment;
const httpProtocol = useSecureProtocol ? 'https' : 'http';
const wsProtocol = useSecureProtocol ? 'wss' : 'ws';

// Extract domain without protocol from API URL for flexible configuration
const extractDomain = (url) => {
  if (!url) return '';
  return url.replace(/^(https?:\/\/|wss?:\/\/)/, '').split('/')[0];
};

const apiDomain = extractDomain(API_DOMAIN);
const socketDomain = extractDomain(SOCKET_DOMAIN);

// Export the server URLs with proper API paths
export const server = `${httpProtocol}://${apiDomain}/api/v2`;
export const backend_url = `${httpProtocol}://${apiDomain}/`;
export const socket_url = `${wsProtocol}://${socketDomain}`; 

// Helper function to debug connection URLs
export function debugConnection(url) {
  console.log(`Connecting to: ${url}`);
  return url;
}

// Helper function to get fallback URL (HTTP when HTTPS fails)
export function getFallbackUrl(url) {
  if (url.startsWith('https://')) {
    return url.replace('https://', 'http://');
  } else if (url.startsWith('wss://')) {
    return url.replace('wss://', 'ws://');
  }
  return url;
}

// Socket.IO connection options
export function getSocketOptions() {
  return {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    path: '/socket.io',
  };
}
