/**
 * Runtime configuration for Bhavya Bazaar (Production)
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * CRITICAL: NO process.env references - pure browser JavaScript only!
 * Encoding: UTF-8 without BOM - Fixed June 6, 2025
 */

window.__RUNTIME_CONFIG__ = {
  API_URL: "https://api.bhavyabazaar.com/api/v2",
  SOCKET_URL: "wss://api.bhavyabazaar.com/ws",
  BACKEND_URL: "https://api.bhavyabazaar.com",
  NODE_ENV: "production",
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true
  },
  VERSION: "2.0.1",
  BUILD_TIME: "2025-06-06T15:30:00.000Z",
  DEBUG: false
};

window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;
console.log("Runtime config loaded successfully - v2.0.1:", window.__RUNTIME_CONFIG__);