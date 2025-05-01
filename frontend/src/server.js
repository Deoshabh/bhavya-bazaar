// Backend URLs - directly use the actual domains rather than constructing them
// This ensures we're connecting to the right servers
const SOCKET_DOMAIN = "so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io";
const API_DOMAIN = "api.bhavyabazaar.com";
const FRONTEND_DOMAIN = "bhavyabazaar.com";

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development' || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

// Use non-secure protocol for now until SSL certificates are properly configured
const useSecureProtocol = false; // Set to false to avoid certificate issues
const httpProtocol = useSecureProtocol ? 'https' : 'http';
const wsProtocol = useSecureProtocol ? 'wss' : 'ws';

// Export the server URLs with explicit port numbers
export const server = `${httpProtocol}://${API_DOMAIN}`;
export const backend_url = `${httpProtocol}://${API_DOMAIN}/`;
export const socket_url = `${wsProtocol}://${SOCKET_DOMAIN}:4000`; // Use port 4000 as specified in your setup

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
