import io from 'socket.io-client';
import { SOCKET_URL } from './server';

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        // Determine if we're in development based on the socket URL
        const isDevelopment = SOCKET_URL.startsWith('ws://') || SOCKET_URL.includes('localhost');
        
        const options = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity, // Keep trying to reconnect
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            forceNew: true,
            path: '/socket.io',
            secure: !isDevelopment, // Only secure in production
            rejectUnauthorized: !isDevelopment, // Only strict SSL in production
            withCredentials: true,
            transportOptions: {
                polling: {
                    extraHeaders: isDevelopment ? {} : {
                        'Origin': 'https://bhavyabazaar.com'
                    }
                }
            }
        };

        try {
            socket = io(SOCKET_URL, options);
            
            socket.on('connect', () => {
                console.log('Socket connected successfully to:', SOCKET_URL);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                // Try to reconnect with polling if WebSocket fails
                if (socket.io.opts.transports.includes('websocket')) {
                    console.log('Falling back to polling transport');
                    socket.io.opts.transports = ['polling', 'websocket'];
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                if (reason === 'io server disconnect') {
                    // Server initiated disconnect, try reconnecting
                    socket.connect();
                }
            });

            // Handle errors globally
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

        } catch (error) {
            console.error('Socket initialization error:', error);
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
