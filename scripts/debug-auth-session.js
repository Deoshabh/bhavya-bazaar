#!/usr/bin/env node

/**
 * Debug Authentication Session Script
 * Tests the complete authentication flow and session persistence
 */

const axios = require('axios');

const BASE_URL = 'https://api.bhavyabazaar.com';

// Create axios instance with cookie jar simulation
const createCookieJar = () => {
  const cookies = new Map();
  
  return {
    setCookies: (setCookieHeaders) => {
      if (!setCookieHeaders) return;
      const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      
      headers.forEach(header => {
        const [cookiePart] = header.split(';');
        const [name, value] = cookiePart.split('=');
        if (name && value) {
          cookies.set(name, value);
          console.log(`🍪 Stored cookie: ${name}=${value}`);
        }
      });
    },
    
    getCookieHeader: () => {
      if (cookies.size === 0) return undefined;
      return Array.from(cookies.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    },
    
    getAllCookies: () => Object.fromEntries(cookies),
    
    hasCookie: (name) => cookies.has(name)
  };
};

const makeRequest = async (url, options = {}) => {
  try {
    console.log(`\n🌐 Making request to: ${url}`);
    if (options.headers?.Cookie) {
      console.log(`🍪 Sending cookies: ${options.headers.Cookie}`);
    }
    
    const response = await axios({
      url,
      timeout: 15000,
      validateStatus: () => true, // Don't throw on any status
      ...options
    });
    
    console.log(`📊 Response: ${response.status} ${response.statusText}`);
    if (response.headers['set-cookie']) {
      console.log(`🍪 Received Set-Cookie headers:`, response.headers['set-cookie']);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    throw error;
  }
};

const debugAuthFlow = async () => {
  console.log('🔍 Starting authentication debug session...');
  console.log(`🎯 Base URL: ${BASE_URL}`);
  
  const cookieJar = createCookieJar();
  
  try {
    // Step 1: Test the auth session endpoint without authentication
    console.log('\n📋 Step 1: Testing /api/auth/me without authentication');
    let response = await makeRequest(`${BASE_URL}/api/auth/me`);
    console.log('Response body:', response.data);
    
    // Step 2: Try to login with test credentials (if you have any)
    console.log('\n📋 Step 2: Testing login flow');
    console.log('ℹ️ Skipping login test - requires valid credentials');
    
    // Step 3: Test with manual cookie simulation
    console.log('\n📋 Step 3: Testing with simulated authentication cookie');
    
    // Create a test scenario where we simulate having a cookie
    const testHeaders = {
      'Cookie': 'token=test_token_value',
      'Origin': 'https://bhavyabazaar.com',
      'Referer': 'https://bhavyabazaar.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    response = await makeRequest(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: testHeaders
    });
    console.log('Response body:', response.data);
    
    // Step 4: Test CORS and preflight
    console.log('\n📋 Step 4: Testing CORS preflight');
    response = await makeRequest(`${BASE_URL}/api/auth/me`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://bhavyabazaar.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('CORS preflight response:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods']
    });
    
    // Step 5: Test actual frontend-like request
    console.log('\n📋 Step 5: Testing frontend-like request');
    response = await makeRequest(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://bhavyabazaar.com',
        'Referer': 'https://bhavyabazaar.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Frontend-like request response:', response.data);
    
    console.log('\n✅ Authentication debug session completed');
    
  } catch (error) {
    console.error('\n❌ Debug session failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
  }
};

// Run the debug
debugAuthFlow();
