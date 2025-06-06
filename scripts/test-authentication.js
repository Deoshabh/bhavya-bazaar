const axios = require('axios');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';

// Test authentication workflow
async function testAuthentication() {
    console.log('🔍 Testing Authentication Workflow...\n');
    
    try {
        // Test 1: Check if getuser returns 401 (expected for unauthenticated users)
        console.log('1. Testing /user/getuser (should return 401 for unauthenticated)...');
        try {
            const response = await axios.get(`${API_BASE}/user/getuser`, {
                withCredentials: true,
                timeout: 10000
            });
            console.log('❌ Unexpected success - user should not be authenticated');
            console.log('Response:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Expected 401 - user not authenticated');
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }
        
        // Test 2: Check if getSeller returns 401 (expected for unauthenticated sellers)
        console.log('\n2. Testing /shop/getSeller (should return 401 for unauthenticated)...');
        try {
            const response = await axios.get(`${API_BASE}/shop/getSeller`, {
                withCredentials: true,
                timeout: 10000
            });
            console.log('❌ Unexpected success - seller should not be authenticated');
            console.log('Response:', response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Expected 401 - seller not authenticated');
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }
        
        // Test 3: Check if we can access public endpoints
        console.log('\n3. Testing public endpoints...');
        
        try {
            const products = await axios.get(`${API_BASE}/product/get-all-products`, {
                timeout: 10000
            });
            console.log('✅ Products endpoint working:', products.data.products?.length || 0, 'products');
        } catch (error) {
            console.log('❌ Products endpoint error:', error.response?.data?.message || error.message);
        }
        
        try {
            const events = await axios.get(`${API_BASE}/event/get-all-events`, {
                timeout: 10000
            });
            console.log('✅ Events endpoint working:', events.data.events?.length || 0, 'events');
        } catch (error) {
            console.log('❌ Events endpoint error:', error.response?.data?.message || error.message);
        }
        
        // Test 4: Test login endpoint exists
        console.log('\n4. Testing login endpoints availability...');
        
        try {
            const loginResponse = await axios.post(`${API_BASE}/user/login-user`, {
                phoneNumber: 'test',
                password: 'test'
            }, {
                withCredentials: true,
                timeout: 10000
            });
            console.log('❌ Login should fail with invalid credentials');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ User login endpoint is working (returns 400 for invalid credentials)');
            } else {
                console.log('❌ User login endpoint error:', error.response?.data?.message || error.message);
            }
        }
        
        try {
            const shopLoginResponse = await axios.post(`${API_BASE}/shop/login-shop`, {
                phoneNumber: 'test',
                password: 'test'
            }, {
                withCredentials: true,
                timeout: 10000
            });
            console.log('❌ Shop login should fail with invalid credentials');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Shop login endpoint is working (returns 400 for invalid credentials)');
            } else {
                console.log('❌ Shop login endpoint error:', error.response?.data?.message || error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testAuthentication();
