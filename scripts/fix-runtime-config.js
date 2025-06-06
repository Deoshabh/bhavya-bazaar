#!/usr/bin/env node

/**
 * Fix runtime-config.js encoding issues for Coolify deployment
 * This script recreates the file with proper UTF-8 encoding
 */

const fs = require('fs');
const path = require('path');

const configContent = `/**
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
`;

const publicPath = path.join(__dirname, '..', 'frontend', 'public', 'runtime-config.js');
const buildPath = path.join(__dirname, '..', 'frontend', 'build', 'runtime-config.js');

try {
  // Write to public directory with explicit UTF-8 encoding
  fs.writeFileSync(publicPath, configContent, { encoding: 'utf8' });
  console.log('✅ Fixed public/runtime-config.js encoding');
  
  // Write to build directory with explicit UTF-8 encoding
  fs.writeFileSync(buildPath, configContent, { encoding: 'utf8' });
  console.log('✅ Fixed build/runtime-config.js encoding');
  
  // Verify the files can be read properly
  const publicContent = fs.readFileSync(publicPath, 'utf8');
  const buildContent = fs.readFileSync(buildPath, 'utf8');
  
  console.log('✅ Both files verified as valid UTF-8');
  console.log(`📏 Public file size: ${Buffer.byteLength(publicContent, 'utf8')} bytes`);
  console.log(`📏 Build file size: ${Buffer.byteLength(buildContent, 'utf8')} bytes`);
  
} catch (error) {
  console.error('❌ Error fixing runtime-config.js:', error.message);
  process.exit(1);
}
