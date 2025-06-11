#!/usr/bin/env node

/**
 * TEST CONTAINER CONNECTIVITY
 * 
 * This script tests if the container can reach external APIs
 */

const axios = require('axios');

async function testContainerConnectivity() {
  console.log('🔍 Testing Container Connectivity...');
  
  // Test 1: Health endpoint
  try {
    console.log('\n📊 Testing health endpoint...');
    const healthResponse = await axios.get('https://api.bhavyabazaar.com/api/v2/health', {
      timeout: 5000
    });
    console.log('✅ Health check successful:', healthResponse.data.status);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test 2: Admin login
  try {
    console.log('\n🔐 Testing admin login...');
    const loginResponse = await axios.post('https://api.bhavyabazaar.com/api/auth/login-admin', {
      email: 'superadmin@bhavyabazaar.com',
      password: 'SuperAdmin@2024!'
    }, {
      timeout: 5000,
      withCredentials: true
    });
    console.log('✅ Admin login successful:', loginResponse.data.success);
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('   → Timeout error: Container cannot reach external API');
    }
  }

  // Test 3: Local server connection (if running)
  try {
    console.log('\n🏠 Testing local server connection...');
    const localResponse = await axios.get('http://localhost:8000/api/v2/health', {
      timeout: 3000
    });
    console.log('✅ Local server reachable:', localResponse.data.status);
  } catch (error) {
    console.error('❌ Local server not reachable:', error.message);
  }

  console.log('\n🎯 Connectivity test complete!');
}

testContainerConnectivity();
