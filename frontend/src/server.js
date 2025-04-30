// Use environment variables for API endpoints and socket URL
export const server = process.env.REACT_APP_API_URL || "https://api.bhavyabazaar.com";

export const backend_url = process.env.REACT_APP_BACKEND_URL || "https://api.bhavyabazaar.com/";

export const socket_url = process.env.REACT_APP_SOCKET_URL || "wss://bhavyabazaar.com:3003/socket.io";

// Helper to determine if we're in development mode
export const isDevelopment = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
