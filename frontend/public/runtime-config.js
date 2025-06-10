/**
 * Runtime configuration for Bhavya Bazaar
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Encoding: UTF-8 without BOM
 */
window.__RUNTIME_CONFIG__ = {
  API_URL: "https://api.bhavyabazaar.com/api/v2",
  BACKEND_URL: "https://api.bhavyabazaar.com",
  FRONTEND_URL: "https://bhavyabazaar.com",
  NODE_ENV: "production",
  DEBUG: false,
  VERSION: "2.0.3",
  SERVER_TYPE: "nodejs", // Indicates Node.js server instead of static
  API_TIMEOUT: 15000,
  SECURE: true,
  FEATURES: {
    ENHANCED_IMAGES: true,
    BRAND_DETECTION: true,
    FALLBACK_SYSTEM: true,
    SPA_ROUTING: true, // SPA routing handled by Node.js server
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true,
    ENABLE_EXHIBITOR_FEATURES: true
  },
  SOCKET: {
    URL: "https://api.bhavyabazaar.com",
    SOKETI_APP_ID: "Js3axIJci9Zlwl88",
    SOKETI_APP_KEY: "TzBt",
    SOKETI_CLUSTER: "mt1",
    SOKETI_HOST: "soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io",
    SOKETI_PATH: "/ws",
    SOKETI_PORT: 443,
    SOKETI_TLS: true,
    USE_SOKETI: true
  }
};

// Compatibility alias for older components
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log configuration load for debugging
console.log("✅ Runtime configuration loaded:", window.__RUNTIME_CONFIG__);