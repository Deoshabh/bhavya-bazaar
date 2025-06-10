#!/usr/bin/env node

/**
 * Path Diagnostic Script for Coolify
 * Helps determine the correct paths for the admin script
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Coolify Path Diagnostics');
console.log('='.repeat(50));
console.log(`Current Directory: ${process.cwd()}`);
console.log(`Script Location: ${__filename}`);
console.log(`Script Directory: ${__dirname}`);

// Check for common directory structures
const pathsToCheck = [
  './model/shop.js',
  '../model/shop.js',
  '../../model/shop.js',
  '/app/model/shop.js',
  '/app/backend/model/shop.js'
];

console.log('\n📁 Checking for model files:');
pathsToCheck.forEach(testPath => {
  const fullPath = path.resolve(testPath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${testPath} → ${fullPath}`);
});

// List current directory contents
console.log('\n📂 Current Directory Contents:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stat = fs.statSync(file);
    const type = stat.isDirectory() ? '📁' : '📄';
    console.log(`${type} ${file}`);
  });
} catch (error) {
  console.log(`❌ Error reading directory: ${error.message}`);
}

// Check parent directory
console.log('\n📂 Parent Directory Contents:');
try {
  const files = fs.readdirSync('..');
  files.forEach(file => {
    const stat = fs.statSync(path.join('..', file));
    const type = stat.isDirectory() ? '📁' : '📄';
    console.log(`${type} ${file}`);
  });
} catch (error) {
  console.log(`❌ Error reading parent directory: ${error.message}`);
}

console.log('\n🎯 Recommended Fix:');
console.log('Based on the results above, update the require paths in coolify-admin.js');
