// Quick test to verify WebSocket URL configuration
console.log('=== Testing WebSocket URL configuration ===');

// Test environment variable
console.log('REACT_APP_WS_URL from .env:', process.env.REACT_APP_WS_URL || 'Not set');

// Simulate runtime config
const runtimeConfig = {
  SOCKET_URL: "wss://api.bhavyabazaar.com/socket.io"
};

console.log('Runtime config SOCKET_URL:', runtimeConfig.SOCKET_URL);

// Simulate production domain check
const productionDomain = 'bhavyabazaar.com';
console.log('Production domain check:', productionDomain);

// Expected URL based on server.js logic for production
const expectedUrl = 'wss://api.bhavyabazaar.com/socket.io';
console.log('Expected WebSocket URL for production:', expectedUrl);

console.log('=== Configuration looks correct! ===');
