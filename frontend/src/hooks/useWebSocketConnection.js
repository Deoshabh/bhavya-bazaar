import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';

const useWebSocketConnection = (url, options = {}) => {
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastMessage, setLastMessage] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);
    const maxRetries = options.maxRetries || 5;
    const retryDelay = options.retryDelay || 3000;

    useEffect(() => {
        if (!url) return;

        const connect = () => {
            try {
                setConnectionStatus('Connecting');
                setError(null);
                
                ws.current = new WebSocket(url);

                ws.current.onopen = () => {
                    console.log('WebSocket connected successfully');
                    setConnectionStatus('Connected');
                    setRetryCount(0);
                    setError(null);
                    
                    if (options.showToasts) {
                        toast.success('Connected to server');
                    }
                };

                ws.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        setLastMessage(data);
                        
                        if (options.onMessage) {
                            options.onMessage(data);
                        }
                    } catch (parseError) {
                        console.error('Failed to parse WebSocket message:', parseError);
                        setLastMessage(event.data);
                    }
                };

                ws.current.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    setConnectionStatus('Disconnected');
                    
                    // Only attempt to reconnect if it wasn't a manual close
                    if (event.code !== 1000 && retryCount < maxRetries) {
                        setRetryCount(prev => prev + 1);
                        reconnectTimeout.current = setTimeout(() => {
                            console.log(`Attempting to reconnect... (${retryCount + 1}/${maxRetries})`);
                            connect();
                        }, retryDelay);
                    } else if (retryCount >= maxRetries) {
                        setError('Failed to connect after maximum retries');
                        if (options.showToasts) {
                            toast.error('Connection failed. Please refresh the page.');
                        }
                    }
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Connection error occurred');
                    setConnectionStatus('Error');
                };

            } catch (connectionError) {
                console.error('Failed to create WebSocket connection:', connectionError);
                setError('Failed to create connection');
                setConnectionStatus('Error');
            }
        };

        connect();

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                ws.current.close(1000, 'Component unmounting');
            }
        };
    }, [url, retryCount, maxRetries, retryDelay]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                const messageString = typeof message === 'string' ? message : JSON.stringify(message);
                ws.current.send(messageString);
                return true;
            } catch (sendError) {
                console.error('Failed to send message:', sendError);
                setError('Failed to send message');
                return false;
            }
        } else {
            console.warn('WebSocket is not connected');
            setError('Not connected to server');
            return false;
        }
    };

    const reconnect = () => {
        if (ws.current) {
            ws.current.close();
        }
        setRetryCount(0);
    };

    return {
        connectionStatus,
        lastMessage,
        error,
        retryCount,
        sendMessage,
        reconnect,
        isConnected: connectionStatus === 'Connected'
    };
};

export default useWebSocketConnection;
