/**
 * Runtime configuration for Bhavya Bazaar (Development)
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Generated on: 2025-06-05T18:47:43.212Z
 */

// Define runtime configuration with fallbacks
window.__RUNTIME_CONFIG__ = {
  // API URL with fallbacks (runtime > env > hardcoded)
  API_URL: process.env.REACT_APP_API_URL || "https://api.bhavyabazaar.com/api/v2",
  
  // Socket URL for real-time communication
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || "wss://api.bhavyabazaar.com/ws",
  
  // Base URL for assets and uploads
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "https://api.bhavyabazaar.com",
  
  // Environment indicator
  NODE_ENV: process.env.NODE_ENV || "production",
  
  // Feature flags
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: process.env.NODE_ENV === "production"
  },
  
  // Version info for debugging
  VERSION: process.env.REACT_APP_VERSION || "1.0.0",
  
  // Build timestamp
  BUILD_TIME: process.env.REACT_APP_BUILD_TIME || "2025-06-05T18:47:43.212Z",
  
  // Debug mode (disabled by default in production)
  DEBUG: process.env.REACT_APP_DEBUG === "true" || false
};

// Backward compatibility for code still using RUNTIME_CONFIG without the double underscore
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log configuration in non-production environments
if (window.__RUNTIME_CONFIG__.NODE_ENV !== "production") {
  console.log("Runtime configuration loaded:", window.__RUNTIME_CONFIG__);
}
