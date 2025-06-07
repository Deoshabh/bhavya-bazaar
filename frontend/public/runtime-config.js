/**
 * Runtime configuration for Bhavya Bazaar
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Encoding: UTF-8 without BOM
 */
window.__RUNTIME_CONFIG__ = {
  API_URL: "https://api.bhavyabazaar.com/api/v2",
  SOCKET_URL: "wss://api.bhavyabazaar.com/ws", 
  BACKEND_URL: "https://api.bhavyabazaar.com",
  NODE_ENV: "production",
  DEBUG: false,
  VERSION: "2.0.0",
  FEATURES: {
    ENHANCED_IMAGES: true,
    BRAND_DETECTION: true,
    FALLBACK_SYSTEM: true
  }
};

// Compatibility alias for older components
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log configuration load for debugging
console.log("✅ Runtime configuration loaded:", window.__RUNTIME_CONFIG__);