/**
 * Soketi WebSocket Client for Bhavya Bazaar
 * Uses Pusher.js to connect to Soketi WebSocket server
 */
import Pusher from 'pusher-js';

let pusher = null;
let connection = null;

// Get Soketi configuration from runtime config or environment
const getSoketiConfig = () => {
    // Try runtime config first
    if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.SOKETI) {
        const config = window.__RUNTIME_CONFIG__.SOKETI;
        console.log('📡 Using runtime config for Soketi:', config);
        return config;
    }
    
    // Fallback to environment variables
    const envConfig = {
        APP_ID: process.env.REACT_APP_SOKETI_APP_ID || 'Js3axIJci9Zlwl88',
        APP_KEY: process.env.REACT_APP_SOKETI_APP_KEY || 'TzBt', // Should be full key in production
        HOST: process.env.REACT_APP_SOKETI_HOST || 'soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io',
        PORT: parseInt(process.env.REACT_APP_SOKETI_PORT || '443'),
        PATH: process.env.REACT_APP_SOKETI_PATH || '/ws',
        TLS: process.env.REACT_APP_SOKETI_TLS !== 'false',
        CLUSTER: process.env.REACT_APP_SOKETI_CLUSTER || 'mt1'
    };
    console.log('📡 Using environment config for Soketi:', envConfig);
    return envConfig;
};

// Initialize Soketi connection
export const initializeSoketi = () => {
    if (pusher) {
        console.log('🔌 Soketi already initialized');
        return pusher;
    }

    const config = getSoketiConfig();
    
    console.log('🔌 Initializing Soketi connection...');
    console.log(`📡 Host: ${config.HOST}:${config.PORT}`);
    console.log(`🔒 TLS: ${config.TLS ? 'enabled' : 'disabled'}`);
    console.log(`🛤️ Path: ${config.PATH}`);
    console.log(`🆔 App ID: ${config.APP_ID}`);
    console.log(`🔑 App Key: ${config.APP_KEY?.substring(0, 4)}...`);

    try {
        // Configure Pusher for Soketi
        pusher = new Pusher(config.APP_KEY, {
            wsHost: config.HOST,
            wsPort: config.PORT,
            wsPath: config.PATH,
            forceTLS: config.TLS,
            enabledTransports: ['ws', 'wss'],
            disableStats: true, // Disable Pusher stats for Soketi
            cluster: config.CLUSTER,
            
            // Enhanced connection options
            activityTimeout: 30000,
            pongTimeout: 6000,
            unavailableTimeout: 10000,
              // Authorization for private/presence channels (now session-based)
            authorizer: (channel, options) => {
                return {
                    authorize: (socketId, callback) => {
                        // Use session-based authentication for WebSocket authorization
                        fetch(`${window.__RUNTIME_CONFIG__?.API_URL || '/api'}/pusher/auth`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include', // Include session cookies
                            body: JSON.stringify({
                                socket_id: socketId,
                                channel_name: channel.name
                            })
                        })
                        .then(response => response.json())
                        .then(data => callback(false, data))
                        .catch(err => {
                            console.error('❌ Pusher auth error:', err);
                            callback(true, null);
                        });
                    }
                };
            }
        });        // Connection event handlers
        pusher.connection.bind('connected', () => {
            console.log('✅ Soketi connected successfully!');
            console.log(`🆔 Socket ID: ${pusher.connection.socket_id}`);
            console.log(`🚀 State: ${pusher.connection.state}`);
            console.log(`🌐 Connection URL: wss://${config.HOST}:${config.PORT}${config.PATH}`);
            connection = pusher.connection;
        });

        pusher.connection.bind('connecting', () => {
            console.log('🔄 Connecting to Soketi...');
            console.log(`🎯 Attempting: wss://${config.HOST}:${config.PORT}${config.PATH}`);
        });

        pusher.connection.bind('unavailable', () => {
            console.warn('⚠️ Soketi connection unavailable');
            console.warn('💡 Check if Soketi service is running and accessible');
            console.warn(`🌐 Verify URL: wss://${config.HOST}:${config.PORT}${config.PATH}`);
        });

        pusher.connection.bind('failed', () => {
            console.error('❌ Soketi connection failed');
            console.error('💡 Possible issues:');
            console.error('   • Soketi service not running');
            console.error('   • Incorrect host/port configuration');
            console.error('   • Network/firewall blocking connection');
            console.error('   • TLS/SSL certificate issues');
            console.error(`🌐 Failed URL: wss://${config.HOST}:${config.PORT}${config.PATH}`);
        });

        pusher.connection.bind('disconnected', () => {
            console.log('🔌 Soketi disconnected');
        });

        pusher.connection.bind('error', (error) => {
            console.error('🚨 Soketi error:', error);
            console.error('🔧 Configuration used:', config);
        });

        // Global error handler
        pusher.bind('pusher:error', (error) => {
            console.error('🚨 Pusher error:', error);
        });

        console.log('🎯 Soketi client initialized successfully');
        return pusher;

    } catch (error) {
        console.error('❌ Failed to initialize Soketi:', error);
        pusher = null;
        return null;
    }
};

// Subscribe to a channel
export const subscribeToChannel = (channelName, eventHandlers = {}) => {
    if (!pusher) {
        console.warn('⚠️ Soketi not initialized. Call initializeSoketi() first.');
        return null;
    }

    console.log(`📡 Subscribing to channel: ${channelName}`);
    
    try {
        const channel = pusher.subscribe(channelName);

        // Bind event handlers
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            channel.bind(event, handler);
            console.log(`🎧 Bound event handler for: ${event}`);
        });

        // Channel-specific event handlers
        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Successfully subscribed to: ${channelName}`);
        });

        channel.bind('pusher:subscription_error', (error) => {
            console.error(`❌ Subscription error for ${channelName}:`, error);
        });

        return channel;

    } catch (error) {
        console.error(`❌ Failed to subscribe to ${channelName}:`, error);
        return null;
    }
};

// Unsubscribe from a channel
export const unsubscribeFromChannel = (channelName) => {
    if (!pusher) {
        console.warn('⚠️ Soketi not initialized');
        return;
    }

    console.log(`📡 Unsubscribing from channel: ${channelName}`);
    pusher.unsubscribe(channelName);
};

// Send a client event (for client-to-client communication)
export const sendClientEvent = (channelName, eventName, data) => {
    if (!pusher) {
        console.warn('⚠️ Soketi not initialized');
        return false;
    }

    try {
        const channel = pusher.channel(channelName);
        if (channel) {
            channel.trigger(`client-${eventName}`, data);
            console.log(`📤 Sent client event: client-${eventName} to ${channelName}`);
            return true;
        } else {
            console.warn(`⚠️ Channel ${channelName} not found`);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to send client event:', error);
        return false;
    }
};

// Get connection state
export const getConnectionState = () => {
    return pusher ? pusher.connection.state : 'disconnected';
};

// Get socket ID
export const getSocketId = () => {
    return pusher ? pusher.connection.socket_id : null;
};

// Disconnect Soketi
export const disconnectSoketi = () => {
    if (pusher) {
        console.log('🔌 Disconnecting Soketi...');
        pusher.disconnect();
        pusher = null;
        connection = null;
    }
};

// Get the Pusher instance
export const getSoketiInstance = () => pusher;

// Test connection with diagnostics
export const testSoketiConnection = () => {
    console.log('🧪 Testing Soketi connection...');
    
    const config = getSoketiConfig();
    console.log('📋 Configuration:', config);
    
    if (!pusher) {
        console.log('⚡ Initializing Soketi for test...');
        initializeSoketi();
    }
    
    if (pusher) {
        console.log(`🔍 Current state: ${pusher.connection.state}`);
        console.log(`🆔 Socket ID: ${pusher.connection.socket_id || 'Not connected'}`);
        
        // Test channel subscription
        const testChannel = subscribeToChannel('test-channel', {
            'test-event': (data) => {
                console.log('✅ Test event received:', data);
            }
        });
        
        setTimeout(() => {
            if (testChannel) {
                unsubscribeFromChannel('test-channel');
                console.log('🧹 Test completed');
            }
        }, 5000);
    }
};

export default {
    initializeSoketi,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendClientEvent,
    getConnectionState,
    getSocketId,
    disconnectSoketi,
    getSoketiInstance,
    testSoketiConnection
};
