#!/usr/bin/env node

/**
 * Production Login Diagnostic Script for Bhavya Bazaar
 * This script helps diagnose login issues in production environment
 */

const https = require('https');
const http = require('http');

// Production configuration
const PRODUCTION_CONFIG = {
  frontend: 'https://bhavyabazaar.com',
  backend: 'https://api.bhavyabazaar.com',
  apiBase: 'https://api.bhavyabazaar.com/api/v2'
};

// Test data for login
const TEST_LOGIN_DATA = {
  phoneNumber: '1234567890', // Replace with a valid test user
  password: 'testpassword'
};

console.log('🔍 Bhavya Bazaar Production Login Diagnostic');
console.log('============================================\n');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestModule = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bhavya-Bazaar-Diagnostic/1.0',
        ...options.headers
      },
      timeout: 10000
    };

    if (options.data) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
    }

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          parsed: (() => {
            try {
              return JSON.parse(data);
            } catch {
              return data;
            }
          })()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
}

async function testConnectivity() {
  console.log('1️⃣ Testing Basic Connectivity');
  console.log('-----------------------------');

  // Test backend health
  try {
    const healthResponse = await makeRequest(`${PRODUCTION_CONFIG.apiBase}/health`);
    console.log(`✅ Backend Health: ${healthResponse.statusCode} - ${JSON.stringify(healthResponse.parsed)}`);
  } catch (error) {
    console.log(`❌ Backend Health Failed: ${error.message}`);
    return false;
  }

  // Test frontend
  try {
    const frontendResponse = await makeRequest(PRODUCTION_CONFIG.frontend);
    console.log(`✅ Frontend: ${frontendResponse.statusCode} - Accessible`);
  } catch (error) {
    console.log(`❌ Frontend Failed: ${error.message}`);
  }

  return true;
}

async function testCORS() {
  console.log('\n2️⃣ Testing CORS Configuration');
  console.log('------------------------------');

  try {
    const corsResponse = await makeRequest(`${PRODUCTION_CONFIG.apiBase}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': PRODUCTION_CONFIG.frontend,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log(`CORS Preflight Status: ${corsResponse.statusCode}`);
    console.log(`CORS Headers:`, corsResponse.headers);
    
    const allowOrigin = corsResponse.headers['access-control-allow-origin'];
    const allowCredentials = corsResponse.headers['access-control-allow-credentials'];
    
    if (allowOrigin === PRODUCTION_CONFIG.frontend || allowOrigin === '*') {
      console.log('✅ CORS Origin: Properly configured');
    } else {
      console.log(`❌ CORS Origin Issue: Expected ${PRODUCTION_CONFIG.frontend}, got ${allowOrigin}`);
    }

    if (allowCredentials === 'true') {
      console.log('✅ CORS Credentials: Enabled');
    } else {
      console.log('❌ CORS Credentials: Not enabled (required for cookies)');
    }

  } catch (error) {
    console.log(`❌ CORS Test Failed: ${error.message}`);
  }
}

async function testLoginEndpoint() {
  console.log('\n3️⃣ Testing Login Endpoint');
  console.log('-------------------------');

  // Test with invalid credentials to check endpoint response
  const testData = JSON.stringify({
    phoneNumber: '0000000000',
    password: 'invalid'
  });

  try {
    const loginResponse = await makeRequest(`${PRODUCTION_CONFIG.apiBase}/user/login-user`, {
      method: 'POST',
      data: testData,
      headers: {
        'Origin': PRODUCTION_CONFIG.frontend,
        'Referer': PRODUCTION_CONFIG.frontend
      }
    });

    console.log(`Login Endpoint Status: ${loginResponse.statusCode}`);
    console.log(`Login Response:`, loginResponse.parsed);

    if (loginResponse.statusCode === 400 && loginResponse.parsed.message) {
      console.log('✅ Login Endpoint: Responding correctly to invalid credentials');
    } else if (loginResponse.statusCode === 500) {
      console.log('❌ Login Endpoint: Server error - check database connection');
    } else {
      console.log('⚠️  Login Endpoint: Unexpected response');
    }

  } catch (error) {
    console.log(`❌ Login Test Failed: ${error.message}`);
  }
}

async function testDatabaseConnectivity() {
  console.log('\n4️⃣ Testing Database Operations');
  console.log('------------------------------');

  try {
    // Try to get users list (admin endpoint) to test DB
    const dbResponse = await makeRequest(`${PRODUCTION_CONFIG.apiBase}/user/admin-all-users`);
    
    if (dbResponse.statusCode === 401) {
      console.log('✅ Database: Connected (authentication required response)');
    } else if (dbResponse.statusCode === 500) {
      console.log('❌ Database: Connection issues detected');
    } else {
      console.log(`⚠️  Database: Unexpected response ${dbResponse.statusCode}`);
    }

  } catch (error) {
    console.log(`❌ Database Test Failed: ${error.message}`);
  }
}

async function testEnvironmentVariables() {
  console.log('\n5️⃣ Environment Configuration Check');
  console.log('----------------------------------');

  // Test for common environment variable issues
  try {
    const envTestResponse = await makeRequest(`${PRODUCTION_CONFIG.apiBase}/health`);
    
    // Check response headers for clues about environment
    const serverHeader = envTestResponse.headers.server;
    const poweredBy = envTestResponse.headers['x-powered-by'];
    
    console.log(`Server: ${serverHeader || 'Not disclosed'}`);
    console.log(`Powered By: ${poweredBy || 'Not disclosed'}`);
    
    // The backend should respond with environment info in health check
    if (envTestResponse.parsed && envTestResponse.parsed.timestamp) {
      console.log('✅ Backend: Properly responding with timestamp');
    } else {
      console.log('⚠️  Backend: Basic health check format issue');
    }

  } catch (error) {
    console.log(`❌ Environment Test Failed: ${error.message}`);
  }
}

async function runDiagnostics() {
  try {
    const isConnected = await testConnectivity();
    
    if (!isConnected) {
      console.log('\n❌ Cannot proceed with diagnostics - backend is not accessible');
      return;
    }

    await testCORS();
    await testLoginEndpoint();
    await testDatabaseConnectivity();
    await testEnvironmentVariables();

    console.log('\n📋 Diagnostic Summary and Recommendations');
    console.log('==========================================');
    console.log('Common production login issues:');
    console.log('');
    console.log('1. **CORS Configuration Issues**');
    console.log('   - Check CORS_ORIGIN environment variable in backend');
    console.log('   - Should include: https://bhavyabazaar.com');
    console.log('');
    console.log('2. **Database Connection Problems**');
    console.log('   - Verify MongoDB connection string (DB_URI)');
    console.log('   - Check database server status');
    console.log('   - Verify authentication credentials');
    console.log('');
    console.log('3. **Environment Variables Missing**');
    console.log('   - JWT_SECRET_KEY must be set');
    console.log('   - ACTIVATION_SECRET must be set');
    console.log('   - NODE_ENV should be "production"');
    console.log('');
    console.log('4. **SSL/TLS Certificate Issues**');
    console.log('   - Verify SSL certificates are valid');
    console.log('   - Check if Coolify proxy is properly configured');
    console.log('');
    console.log('5. **Network/Firewall Issues**');
    console.log('   - Ensure backend ports are accessible');
    console.log('   - Check VPS firewall settings');
    console.log('');

  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}

// Run diagnostics
runDiagnostics();
