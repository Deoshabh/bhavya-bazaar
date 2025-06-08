import io from 'socket.io-client';

let socket = null;

// Get WebSocket URL from runtime config or fallback
const getSocketURL = () => {
    if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
        return window.__RUNTIME_CONFIG__.SOCKET_URL;
    }
    
    // Fallback for development
    if (process.env.NODE_ENV === 'development') {
        return process.env.REACT_APP_WS_URL || 'http://localhost:8000';
    }
    
    // Production fallback
    return 'https://api.bhavyabazaar.com';
};

export const initializeSocket = () => {
    if (!socket) {
        const SOCKET_URL = getSocketURL();
        
        // Determine if we're in development
        const isDevelopment = SOCKET_URL.includes('localhost') || process.env.NODE_ENV === 'development';
        
        console.log(`🔌 Initializing socket connection to: ${SOCKET_URL}`);
        console.log(`🌍 Environment: ${isDevelopment ? 'development' : 'production'}`);
        
        const options = {
            transports: ['polling', 'websocket'], // Start with polling for better compatibility
            reconnection: true,
            reconnectionAttempts: 5, // Reduced for faster failover
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            forceNew: false, // Allow connection reuse
            path: '/socket.io',
            secure: !isDevelopment,
            withCredentials: true,
            upgrade: true,
            rememberUpgrade: true,
            transportOptions: {
                polling: {
                    extraHeaders: isDevelopment ? {} : {
                        'Origin': 'https://bhavyabazaar.com'
                    }
                },
                websocket: {
                    extraHeaders: isDevelopment ? {} : {
                        'Origin': 'https://bhavyabazaar.com'
                    }
                }
            }        };
        
        try {
            // Clear any existing socket before creating new one
            if (socket && socket.connected) {
                socket.disconnect();
                socket = null;
            }
            
            socket = io(SOCKET_URL, options);
            
            socket.on('connect', () => {
                console.log('✅ Socket connected successfully to:', SOCKET_URL);
                console.log('🚀 Transport:', socket.io.engine.transport.name);
                console.log('🆔 Socket ID:', socket.id);
            });

            socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error.message);
                console.log('🔄 Attempting fallback strategies...');
                
                // Progressive fallback strategy
                if (socket.io.opts.transports[0] === 'polling') {
                    console.log('🔄 Trying websocket transport...');
                    socket.io.opts.transports = ['websocket', 'polling'];
                } else {
                    console.log('🔄 Falling back to polling transport...');
                    socket.io.opts.transports = ['polling'];
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason);
                if (reason === 'io server disconnect') {
                    console.log('🔄 Server initiated disconnect, attempting reconnect...');
                    setTimeout(() => socket.connect(), 1000);
                }
            });

            socket.on('reconnect', (attemptNumber) => {
                console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
            });

            socket.on('reconnect_attempt', (attemptNumber) => {
                console.log(`🔄 Reconnect attempt ${attemptNumber}...`);
            });

            socket.on('reconnect_error', (error) => {
                console.error('❌ Reconnect error:', error.message);
            });

            socket.on('reconnect_failed', () => {
                console.error('❌ Socket reconnection failed after maximum attempts');
                socket = null; // Reset socket for next initialization
            });

            // Handle transport upgrade
            socket.io.on('upgrade', () => {
                console.log('⬆️ Transport upgraded to:', socket.io.engine.transport.name);
            });

            // Handle errors globally
            socket.on('error', (error) => {
                console.error('🚨 Socket error:', error);
            });        } catch (error) {
            console.error('❌ Socket initialization error:', error);
            socket = null; // Reset socket on error
        }
    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
