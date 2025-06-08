import React, { useState } from 'react';
import useWebSocketConnection from '../hooks/useWebSocketConnection';

const WebSocketTester = () => {
    const [testMessage, setTestMessage] = useState('');
    const [messages, setMessages] = useState([]);
    
    // Get WebSocket URL from environment or use localhost
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    
    const { 
        connectionStatus, 
        lastMessage, 
        error, 
        retryCount,
        sendMessage, 
        reconnect,
        isConnected 
    } = useWebSocketConnection(wsUrl, {
        maxRetries: 5,
        retryDelay: 3000,
        showToasts: true,
        onMessage: (message) => {
            setMessages(prev => [...prev.slice(-49), { // Keep last 50 messages
                timestamp: new Date().toLocaleTimeString(),
                data: message
            }]);
        }
    });

    const handleSendMessage = () => {
        if (testMessage.trim()) {
            const success = sendMessage({
                type: 'test',
                message: testMessage,
                timestamp: new Date().toISOString()
            });
            
            if (success) {
                setTestMessage('');
            }
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'Connected': return 'text-green-600 bg-green-100';
            case 'Connecting': return 'text-yellow-600 bg-yellow-100';
            case 'Disconnected': return 'text-red-600 bg-red-100';
            case 'Error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">WebSocket Connection Tester</h2>
            
            {/* Connection Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Connection Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                        {connectionStatus}
                    </span>
                </div>
                
                <div className="text-sm text-gray-600">
                    <p>URL: {wsUrl}</p>
                    {retryCount > 0 && (
                        <p>Retry attempts: {retryCount}</p>
                    )}
                    {error && (
                        <p className="text-red-600 mt-2">Error: {error}</p>
                    )}
                </div>
                
                {(!isConnected && connectionStatus !== 'Connecting') && (
                    <button
                        onClick={reconnect}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reconnect
                    </button>
                )}
            </div>

            {/* Message Sender */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Send Test Message</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Enter test message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={!isConnected}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!isConnected || !testMessage.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* Messages Log */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Messages Log</h3>
                <div className="h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 italic">No messages received yet...</p>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((msg, index) => (
                                <div key={index} className="text-sm">
                                    <span className="text-gray-500">[{msg.timestamp}]</span>
                                    <pre className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                                        {JSON.stringify(msg.data, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {messages.length > 0 && (
                    <button
                        onClick={() => setMessages([])}
                        className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Clear Messages
                    </button>
                )}
            </div>

            {/* Connection Info */}
            <div className="text-xs text-gray-500">
                <p>Last message received: {lastMessage ? new Date().toLocaleTimeString() : 'None'}</p>
                <p>This tester helps verify WebSocket connections are working properly.</p>
            </div>
        </div>
    );
};

export default WebSocketTester;
