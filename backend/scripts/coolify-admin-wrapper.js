#!/usr/bin/env node

/**
 * Coolify Admin Script - Fixed Paths Version
 * This version automatically detects the correct paths
 */

console.log('🚀 Starting Coolify Admin Script...');
console.log(`📍 Running from: ${process.cwd()}`);
console.log(`📍 Script location: ${__dirname}`);

// Try to find the correct backend directory
const path = require('path');
const fs = require('fs');

function findBackendDir() {
  const possiblePaths = [
    process.cwd(),                    // Current directory
    path.join(process.cwd(), '..'),   // Parent directory
    '/app',                           // Container root
    '/app/backend',                   // Container backend
    path.join(__dirname, '..'),       // Script parent directory
  ];
  
  for (const testPath of possiblePaths) {
    const modelPath = path.join(testPath, 'model', 'shop.js');
    if (fs.existsSync(modelPath)) {
      console.log(`✅ Found backend directory: ${testPath}`);
      return testPath;
    }
  }
  
  throw new Error('Could not find backend directory with models');
}

try {
  const backendDir = findBackendDir();
  
  // Change to backend directory
  process.chdir(backendDir);
  console.log(`📁 Changed to: ${process.cwd()}`);
  
  // Now require the main admin script
  const adminPath = path.join(backendDir, 'coolify-admin.js');
  if (fs.existsSync(adminPath)) {
    console.log(`🔄 Loading main admin script from: ${adminPath}`);
    require(adminPath);
  } else {
    console.error(`❌ Could not find coolify-admin.js at: ${adminPath}`);
    process.exit(1);
  }
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.log('\n🔍 Directory listing:');
  try {
    fs.readdirSync('.').forEach(file => {
      const stat = fs.statSync(file);
      console.log(`${stat.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (e) {
    console.log('Could not list directory contents');
  }
  process.exit(1);
}
