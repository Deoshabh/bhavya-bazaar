const fs = require('fs');
const path = require('path');
const {
  REACT_APP_API_URL,
  REACT_APP_BACKEND_URL,
  REACT_APP_ENV,
  REACT_APP_DEBUG
} = process.env;

// Use provided environment variables or defaults
const API_URL = REACT_APP_API_URL || 'https://api.bhavyabazaar.com/api/v2';
const BACKEND_URL = REACT_APP_BACKEND_URL || 'https://api.bhavyabazaar.com';
const NODE_ENV = REACT_APP_ENV || 'production';
const DEBUG = REACT_APP_DEBUG === 'true';

console.log(`[generate-runtime-config] Using API_URL: ${API_URL}`);
console.log(`[generate-runtime-config] Using BACKEND_URL: ${BACKEND_URL}`);

const contents = `
/**
 * Runtime configuration for Bhavya Bazaar (Production)
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * CRITICAL: NO process.env references - pure browser JavaScript only!
 */

// Define runtime configuration with static production values
window.__RUNTIME_CONFIG__ = {
  API_URL: "${API_URL}",
  BACKEND_URL: "${BACKEND_URL}",
  NODE_ENV: "${NODE_ENV}",
  DEBUG: ${DEBUG},
  VERSION: "2.0.3",
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true,
    ENABLE_EXHIBITOR_FEATURES: true
  }
};

// Backward compatibility for code still using RUNTIME_CONFIG without underscore
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log successful configuration load for debugging
console.log("✓ Runtime configuration loaded successfully:", window.__RUNTIME_CONFIG__);
`.trimStart();

fs.writeFileSync(path.join(__dirname, '../public/runtime-config.js'), contents, { encoding: 'utf8' });
console.log('[generate-runtime-config] ✅ runtime-config.js written with UTF-8 encoding');
console.log(contents);
