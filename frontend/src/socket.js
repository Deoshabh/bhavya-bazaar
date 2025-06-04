const { SOCKET_URL } = window.RUNTIME_CONFIG || {};
const WS_URL = SOCKET_URL || process.env.REACT_APP_WS_URL;
let socket = null;

export function initSocket() {
  if (!WS_URL) {
    console.error('❌ WebSocket URL is not defined.');
    return;
  }
  console.log('🛰️  Attempting to connect to WebSocket at:', WS_URL);
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('✅ Connected to WebSocket server at', WS_URL);
    socket.send(JSON.stringify({ type: 'CLIENT_CONNECTED', payload: {} }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received message from server:', data);
    } catch (err) {
      console.log('📨 Received non-JSON message:', event.data);
    }
  };

  socket.onclose = (ev) => {
    console.warn('⚠️ WebSocket disconnected:', ev.code, ev.reason);
  };

  socket.onerror = (err) => {
    console.error('❌ WebSocket error:', err);
  };
}

export function sendMessage(payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.warn('⚠️ Cannot send message, socket not open:', socket);
  }
}
