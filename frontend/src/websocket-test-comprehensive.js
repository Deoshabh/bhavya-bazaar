/**
 * Comprehensive WebSocket Connection Test for Bhavya Bazaar
 * Tests both Socket.IO and Soketi connections
 */

// Function to test Soketi connection
const testSoketiConnection = () => {
    console.log('🧪 Testing Soketi WebSocket connection...');
    
    // Check if Pusher is available
    if (typeof window.Pusher === 'undefined') {
        console.error('❌ Pusher.js not loaded. Please ensure it\'s included in your build.');
        return false;
    }
    
    const config = {
        APP_KEY: 'TzBt', // This should be your full app key
        HOST: 'soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io',
        PORT: 443,
        PATH: '/ws',
        TLS: true
    };
    
    console.log(`📡 Connecting to: ${config.TLS ? 'wss' : 'ws'}://${config.HOST}:${config.PORT}${config.PATH}`);
    
    try {
        const pusher = new window.Pusher(config.APP_KEY, {
            wsHost: config.HOST,
            wsPort: config.PORT,
            wsPath: config.PATH,
            forceTLS: config.TLS,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
            cluster: 'mt1'
        });
        
        pusher.connection.bind('connected', () => {
            console.log('✅ Soketi connected successfully!');
            console.log(`🆔 Socket ID: ${pusher.connection.socket_id}`);
            
            // Test channel subscription
            const channel = pusher.subscribe('test-channel');
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('✅ Successfully subscribed to test-channel');
                
                // Test client event
                channel.trigger('client-test', { message: 'Hello from client!' });
                console.log('📤 Sent test client event');
                
                // Cleanup after test
                setTimeout(() => {
                    pusher.unsubscribe('test-channel');
                    pusher.disconnect();
                    console.log('🧹 Soketi test completed');
                }, 3000);
            });
        });
        
        pusher.connection.bind('error', (error) => {
            console.error('❌ Soketi connection error:', error);
        });
        
        pusher.connection.bind('failed', () => {
            console.error('❌ Soketi connection failed');
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Soketi test failed:', error);
        return false;
    }
};

// Function to test Socket.IO connection (fallback)
const testSocketIOConnection = () => {
    console.log('🧪 Testing Socket.IO connection...');
    
    if (typeof window.io === 'undefined') {
        console.error('❌ Socket.IO not loaded');
        return false;
    }
    
    const socketURL = 'https://api.bhavyabazaar.com';
    console.log(`📡 Connecting to: ${socketURL}`);
    
    try {
        const socket = window.io(socketURL, {
            transports: ['polling', 'websocket'],
            timeout: 10000,
            forceNew: true
        });
        
        socket.on('connect', () => {
            console.log('✅ Socket.IO connected successfully!');
            console.log(`🆔 Socket ID: ${socket.id}`);
            
            // Test message
            socket.emit('test', { message: 'Hello from Socket.IO client!' });
            
            // Cleanup
            setTimeout(() => {
                socket.disconnect();
                console.log('🧹 Socket.IO test completed');
            }, 3000);
        });
        
        socket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Socket.IO test failed:', error);
        return false;
    }
};

// Test current configuration
const testCurrentConfig = () => {
    console.log('📋 Current WebSocket Configuration:');
    
    // Runtime config
    if (window.__RUNTIME_CONFIG__) {
        console.log('Runtime Config:', window.__RUNTIME_CONFIG__);
        
        if (window.__RUNTIME_CONFIG__.SOKETI) {
            console.log('✅ Soketi config found');
        } else {
            console.log('⚠️ No Soketi config in runtime config');
        }
    } else {
        console.log('⚠️ No runtime config found');
    }
    
    // Environment info
    console.log('Browser Environment:');
    console.log(`  URL: ${window.location.href}`);
    console.log(`  Protocol: ${window.location.protocol}`);
    console.log(`  Host: ${window.location.host}`);
    
    // Check available libraries
    console.log('Available Libraries:');
    console.log(`  Pusher.js: ${typeof window.Pusher !== 'undefined' ? '✅' : '❌'}`);
    console.log(`  Socket.IO: ${typeof window.io !== 'undefined' ? '✅' : '❌'}`);
};

// Test network connectivity to Soketi host
const testSoketiConnectivity = async () => {
    console.log('🌐 Testing connectivity to Soketi host...');
    
    const soketiHost = 'soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io';
    
    try {
        // Test HTTP connectivity first
        const response = await fetch(`https://${soketiHost}/health`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (response.ok) {
            console.log(`✅ HTTP connectivity to ${soketiHost} successful`);
            return true;
        } else {
            console.warn(`⚠️ HTTP response from ${soketiHost}: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ HTTP connectivity to ${soketiHost} failed:`, error);
        
        // Try alternative connectivity test
        try {
            const img = new Image();
            img.onload = () => console.log(`✅ Basic connectivity to ${soketiHost} confirmed`);
            img.onerror = () => console.error(`❌ No connectivity to ${soketiHost}`);
            img.src = `https://${soketiHost}/favicon.ico?t=${Date.now()}`;
        } catch (e) {
            console.error('❌ Connectivity test failed:', e);
        }
        
        return false;
    }
};

// Main test function
const runWebSocketTests = async () => {
    console.log('🚀 Starting comprehensive WebSocket tests...');
    console.log('=' .repeat(50));
    
    // Test 1: Current configuration
    testCurrentConfig();
    console.log('\\n');
    
    // Test 2: Network connectivity
    await testSoketiConnectivity();
    console.log('\\n');
    
    // Test 3: Soketi connection
    const soketiSuccess = testSoketiConnection();
    console.log('\\n');
    
    // Test 4: Socket.IO fallback (if Soketi fails)
    if (!soketiSuccess) {
        console.log('🔄 Soketi failed, testing Socket.IO fallback...');
        testSocketIOConnection();
    }
    
    console.log('\\n' + '=' .repeat(50));
    console.log('✨ WebSocket tests completed. Check console for results.');
};

// Make functions available globally
if (typeof window !== 'undefined') {
    window.testSoketiConnection = testSoketiConnection;
    window.testSocketIOConnection = testSocketIOConnection;
    window.testCurrentConfig = testCurrentConfig;
    window.testSoketiConnectivity = testSoketiConnectivity;
    window.runWebSocketTests = runWebSocketTests;
    
    console.log('💡 Available test functions:');
    console.log('  - runWebSocketTests() - Run all tests');
    console.log('  - testSoketiConnection() - Test Soketi only');
    console.log('  - testSocketIOConnection() - Test Socket.IO only');
    console.log('  - testCurrentConfig() - Show current config');
    console.log('  - testSoketiConnectivity() - Test network connectivity');
}

// Auto-run tests if this script is loaded directly
if (typeof document !== 'undefined' && document.readyState === 'complete') {
    setTimeout(runWebSocketTests, 1000);
} else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runWebSocketTests, 1000);
    });
}
