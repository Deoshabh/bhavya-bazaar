// WebSocket Connection Test Script for Production
// Run this in browser console to test WebSocket connections
// Note: Import Socket.IO library in your HTML before running this test

const testWebSocketConnections = () => {
  console.log('🧪 Testing WebSocket connections...');
  
  // Check if Socket.IO is available
  if (typeof io === 'undefined') {
    console.error('❌ Socket.IO library not found. Please ensure socket.io-client is loaded.');
    console.log('💡 Add this to your HTML: <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>');
    return;
  }
  
  // Test 1: Socket.IO Connection
  console.log('\n1️⃣ Testing Socket.IO connection...');
  
  if (typeof io !== 'undefined') {
    const socketIOUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_WS_URL) || 'wss://bhavyabazaar.com/socket.io';
    console.log(`Connecting to: ${socketIOUrl}`);
    
    try {
      const socket = window.io(socketIOUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      
      socket.on('connect', () => {
        console.log('✅ Socket.IO connected successfully!');
        console.log(`Socket ID: ${socket.id}`);
        
        // Test message sending
        socket.emit('test-message', { message: 'Hello from frontend!', timestamp: new Date().toISOString() });
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason);
      });
      
      // Clean up after 10 seconds
      setTimeout(() => {
        socket.disconnect();
        console.log('🧹 Socket.IO test completed');
      }, 10000);
      
    } catch (error) {
      console.error('❌ Socket.IO test failed:', error);
    }
  } else {
    console.log('⏭️ Skipping Socket.IO test - library not available');
  }
  
  // Test 2: Native WebSocket Connection
  console.log('\n2️⃣ Testing native WebSocket connection...');
  
  const wsUrl = window.location.protocol === 'https:' ? 
    'wss://bhavyabazaar.com/ws' : 
    'ws://localhost:8000/ws';
  
  console.log(`Connecting to: ${wsUrl}`);
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = (event) => {
      console.log('✅ Native WebSocket connected successfully!');
      
      // Test message sending
      ws.send(JSON.stringify({ 
        type: 'test', 
        message: 'Hello from frontend!', 
        timestamp: new Date().toISOString() 
      }));
    };
    
    ws.onmessage = (event) => {
      console.log('📨 Received WebSocket message:', JSON.parse(event.data));
    };
    
    ws.onerror = (error) => {
      console.error('❌ Native WebSocket error:', error);
    };
    
    ws.onclose = (event) => {
      console.log('🔌 Native WebSocket closed:', event.code, event.reason);
    };
    
    // Clean up after 10 seconds
    setTimeout(() => {
      ws.close();
      console.log('🧹 Native WebSocket test completed');
    }, 10000);
    
  } catch (error) {
    console.error('❌ Native WebSocket test failed:', error);
  }
  
  // Test 3: Check current configuration
  console.log('\n3️⃣ Current WebSocket configuration:');
  console.log('Environment variables:');
  const envWsUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_WS_URL) || 'Not available in browser';
  const envApiUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'Not available in browser';
  const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'Not available in browser';
  
  console.log(`  REACT_APP_WS_URL: ${envWsUrl}`);
  console.log(`  REACT_APP_API_URL: ${envApiUrl}`);
  console.log(`  NODE_ENV: ${nodeEnv}`);
  
  console.log('\nBrowser environment:');
  console.log(`  Current URL: ${window.location.href}`);
  console.log(`  Protocol: ${window.location.protocol}`);
  console.log(`  Hostname: ${window.location.hostname}`);
  console.log(`  Port: ${window.location.port || 'default'}`);
  
  console.log('\n✨ WebSocket tests initiated. Check console for results...');
};

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.testWebSocketConnections = testWebSocketConnections;
  console.log('💡 Run testWebSocketConnections() in console to test connections');
}

// Also try to export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testWebSocketConnections };
} else if (typeof exports !== 'undefined') {
  exports.testWebSocketConnections = testWebSocketConnections;
}
