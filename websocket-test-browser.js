// WebSocket Test for Coolify Deployment
console.log('🧪 Testing WebSocket connection for Coolify...');

// Test WebSocket connection
const wsUrl = 'wss://api.bhavyabazaar.com/socket.io';
console.log(`Testing connection to: ${wsUrl}`);

// Check if Socket.IO is available
if (typeof io === 'undefined') {
  console.error('❌ Socket.IO not loaded. Add this to your page:');
  console.log('<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>');
} else {
  const socket = io(wsUrl, {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    forceNew: true
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected successfully!');
    console.log(`Socket ID: ${socket.id}`);
    console.log('Transport:', socket.io.engine.transport.name);
    
    // Test sending a message
    socket.emit('test-message', { 
      message: 'Hello from Coolify deployment!', 
      timestamp: new Date().toISOString() 
    });
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection failed:', error);
    console.log('💡 Check if backend service is running in Coolify');
    console.log('💡 Verify CORS_ORIGIN includes your frontend domain');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('🚨 WebSocket error:', error);
  });

  // Auto cleanup after 15 seconds
  setTimeout(() => {
    socket.disconnect();
    console.log('🧹 Test completed');
  }, 15000);
}

// Also test current configuration
console.log('\n📋 Current Configuration:');
console.log('Runtime config:', window.__RUNTIME_CONFIG__);
console.log('Current domain:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
