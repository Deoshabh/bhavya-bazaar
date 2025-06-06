const fs = require('fs');
const path = require('path');
const {
  REACT_APP_API_URL,
  REACT_APP_WS_URL,
  REACT_APP_ENV,
  REACT_APP_DEBUG
} = process.env;

if (!REACT_APP_API_URL || !REACT_APP_WS_URL) {
  console.error('[generate-runtime-config] ERROR: REACT_APP_API_URL or REACT_APP_WS_URL is not defined');
  process.exit(1);
}

const contents = `
/**
 * Runtime configuration for Bhavya Bazaar (Production)
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * CRITICAL: NO process.env references - pure browser JavaScript only!
 */

// Define runtime configuration with static production values
window.__RUNTIME_CONFIG__ = {
  API_URL: "${REACT_APP_API_URL || 'https://api.bhavyabazaar.com/api/v2'}",
  SOCKET_URL: "${REACT_APP_WS_URL || 'wss://api.bhavyabazaar.com/ws'}",
  BACKEND_URL: "${REACT_APP_API_URL || 'https://api.bhavyabazaar.com'}",
  NODE_ENV: "${REACT_APP_ENV || 'production'}",
  DEBUG: ${REACT_APP_DEBUG === 'true' ? true : false},
  VERSION: "2.0.0",
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true
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
