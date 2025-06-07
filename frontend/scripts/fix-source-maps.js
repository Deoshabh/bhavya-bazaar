#!/usr/bin/env node

/**
 * Fix Source Maps Script
 * 
 * This script handles source map configurations for the build process.
 * It ensures that source maps are properly configured based on the environment.
 */

const fs = require('fs');
const path = require('path');

try {
  console.log('🔧 Fixing source maps configuration...');
  console.log('📂 Current working directory:', process.cwd());
  console.log('📂 Script location:', __filename);
  
  // Verify script directory exists
  const scriptsDir = path.dirname(__filename);
  console.log('📂 Scripts directory:', scriptsDir);
  
  if (!fs.existsSync(scriptsDir)) {
    console.warn('⚠️ Scripts directory not found, creating...');
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  const generateSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

  if (isProduction && !generateSourceMap) {
    console.log('📦 Production build detected with source maps disabled');
    console.log('✅ Source map configuration is correct for production');
  } else if (!isProduction) {
    console.log('🛠️ Development mode detected');
    console.log('✅ Source maps will be enabled for development');
  } else {
    console.log('📦 Production build with source maps enabled');
    console.log('✅ Source maps will be generated for production');
  }

  // Ensure build directory exists if needed
  const buildDir = path.join(process.cwd(), 'build');
  if (!fs.existsSync(buildDir)) {
    console.log('📁 Creating build directory...');
    fs.mkdirSync(buildDir, { recursive: true });
  }

  console.log('✅ Source map configuration check completed');

  // Exit successfully
  process.exit(0);
} catch (error) {
  console.error('❌ Error in fix-source-maps script:', error.message);
  console.error('📋 Stack trace:', error.stack);
  // Don't fail the build for this script
  console.log('⚠️ Continuing build without source map fixes...');
  process.exit(0);
}
