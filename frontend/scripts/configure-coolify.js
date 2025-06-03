#!/usr/bin/env node

/**
 * Coolify Deployment Configuration Script (Node.js)
 * This script configures the runtime settings for bhavyabazaar.com deployment
 */

const fs = require('fs');
const path = require('path');

// Get environment variables with bhavyabazaar.com defaults
const apiUrl = process.env.API_URL || process.env.REACT_APP_API_URL || 'https://api.bhavyabazaar.com/api/v2';
const socketUrl = process.env.SOCKET_URL || process.env.REACT_APP_SOCKET_URL || 'https://api.bhavyabazaar.com';
const backendUrl = process.env.BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://api.bhavyabazaar.com';

console.log('Configuring runtime environment for bhavyabazaar.com deployment...');
console.log(`API_URL: ${apiUrl}`);
console.log(`SOCKET_URL: ${socketUrl}`);
console.log(`BACKEND_URL: ${backendUrl}`);

// Check if build directory exists
const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found. Make sure to run "npm run build" first.');
    process.exit(1);
}

console.log('Updating runtime configuration in build directory...');

// Create runtime config with actual values
const runtimeConfig = `// Runtime configuration for bhavyabazaar.com deployment
window.runtimeConfig = {
  API_URL: '${apiUrl}',
  SOCKET_URL: '${socketUrl}',
  BACKEND_URL: '${backendUrl}',
  ENV: 'production',
  DEBUG: false
};

console.log('bhavyabazaar.com runtime config loaded:', window.runtimeConfig);
`;

// Write the configuration file
const configPath = path.join(buildDir, 'runtime-config.js');
fs.writeFileSync(configPath, runtimeConfig, 'utf8');

console.log('Runtime configuration updated successfully');
console.log('Deployment configuration complete for bhavyabazaar.com!');