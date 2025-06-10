/**
 * Runtime configuration for Bhavya Bazaar
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Encoding: UTF-8 without BOM
 */
window.__RUNTIME_CONFIG__ = {
  API_URL: "http://localhost:8000/api/v2",
  BACKEND_URL: "http://localhost:8000",
  FRONTEND_URL: "http://localhost:3000",
  NODE_ENV: "development",
  DEBUG: true,
  VERSION: "2.0.0",
  SERVER_TYPE: "nodejs", // Indicates Node.js server instead of static
  FEATURES: {
    ENHANCED_IMAGES: true,
    BRAND_DETECTION: true,
    FALLBACK_SYSTEM: true,
    SPA_ROUTING: true // SPA routing handled by Node.js server
  }
};

// Compatibility alias for older components
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log configuration load for debugging
console.log("✅ Runtime configuration loaded:", window.__RUNTIME_CONFIG__);