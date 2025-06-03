#!/usr/bin/env node

/**
 * Test script to verify API connectivity for bhavyabazaar.com
 */

const https = require('https');
const http = require('http');

// Get API URL from environment or use bhavyabazaar.com default
const apiUrl = process.env.REACT_APP_API_URL || process.env.API_URL || 'https://api.bhavyabazaar.com/api/v2';

console.log(`Testing API connectivity for bhavyabazaar.com...`);
console.log(`API URL: ${apiUrl}`);

// Extract protocol and create appropriate client
const url = new URL(apiUrl + '/health');
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'GET',
  timeout: 10000,
  headers: {
    'User-Agent': 'Bhavya-Bazaar-Test-Client/1.0',
    'Origin': 'https://bhavyabazaar.com'
  }
};

console.log(`Making request to: ${url.protocol}//${url.hostname}:${options.port}${url.pathname}`);

const req = client.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (res.statusCode === 200 && response.status === 'healthy') {
        console.log('✅ bhavyabazaar.com API is healthy and reachable!');
        process.exit(0);
      } else {
        console.log('⚠️ API responded but may not be healthy');
        console.log('Response data:', response);
        process.exit(1);
      }
    } catch (error) {
      console.log('Response body:', data);
      console.log('⚠️ API responded but with non-JSON response');
      if (res.statusCode === 200) {
        console.log('✅ API is reachable (non-JSON response may be normal)');
        process.exit(0);
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  
  // Suggest common fixes
  console.log('\nTroubleshooting suggestions for bhavyabazaar.com:');
  console.log('1. Verify the backend API is deployed at https://api.bhavyabazaar.com');
  console.log('2. Check if the backend service is running in Coolify');
  console.log('3. Verify CORS settings include https://bhavyabazaar.com');
  console.log('4. Check if HTTPS certificates are valid');
  console.log('5. Test direct access: https://api.bhavyabazaar.com/api/v2/health');
  
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  console.log('The backend may be slow to respond or not running');
  req.destroy();
  process.exit(1);
});

req.end();
