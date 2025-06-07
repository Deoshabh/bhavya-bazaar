#!/usr/bin/env node

/**
 * Configure Coolify Script
 * 
 * This script configures the application for Coolify deployment.
 * It handles environment-specific configurations and optimizations.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuring application for Coolify deployment...');

// Configuration for production deployment
const coolifyConfig = {
  timestamp: new Date().toISOString(),
  environment: 'production',
  deployment: 'coolify'
};

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('📁 Created build directory');
}

// Write deployment configuration
const configPath = path.join(buildDir, 'deployment-config.json');
fs.writeFileSync(configPath, JSON.stringify(coolifyConfig, null, 2));
console.log('📝 Written deployment configuration to:', configPath);

// Check for required environment variables
const requiredEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_ENV'
];

let missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
} else {
  console.log('✅ All required environment variables are present');
}

// Additional Coolify-specific optimizations can be added here
// For example: asset optimization, CDN configuration, etc.

console.log('✅ Coolify configuration completed successfully');

// Exit successfully
process.exit(0);
