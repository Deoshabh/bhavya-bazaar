import io from 'socket.io-client';
import { SOCKET_URL } from './server';

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        const options = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            forceNew: true,
            path: '/socket.io',
            secure: process.env.NODE_ENV === 'production',
            rejectUnauthorized: false
        };

        try {
            socket = io(SOCKET_URL, options);
            
            socket.on('connect', () => {
                console.log('Socket connected successfully');
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });
        } catch (error) {
            console.error('Socket initialization error:', error);
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
