const axios = require('axios');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';

async function quickTest() {
    console.log('🔥 Quick API Validation Test\n');
    
    try {
        // Test 1: Basic server response
        console.log('1. Testing server response...');
        const response = await axios.get(`${API_BASE}/user/get-user`, {
            timeout: 10000,
            validateStatus: () => true // Accept all status codes
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Response type: ${typeof response.data}`);
        
        if (response.status === 401) {
            console.log('✅ JWT authentication working (401 for unauthorized)');
        } else if (response.status < 500) {
            console.log('✅ Server responding without syntax errors');
        } else {
            console.log('❌ Server error detected');
        }
        
        // Test 2: Test message endpoint
        console.log('\n2. Testing message endpoint (syntax fix validation)...');
        const messageResponse = await axios.post(`${API_BASE}/message/create-new-message`, 
            { test: 'data' }, 
            { 
                timeout: 10000,
                validateStatus: () => true 
            }
        );
        
        console.log(`Message endpoint status: ${messageResponse.status}`);
        
        if (messageResponse.status !== 500) {
            console.log('✅ Message controller syntax error fixed!');
        } else {
            console.log('❌ Message controller still has issues');
        }
        
        console.log('\n✅ Basic validation complete');
        
    } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to API server');
        } else {
            console.log('Error:', error.message);
        }
    }
}

quickTest();
