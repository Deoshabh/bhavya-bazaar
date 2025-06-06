#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script for Bhavya Bazaar
 * Tests all critical endpoints to ensure proper URL construction and functionality
 */

const axios = require('axios');
const FormData = require('form-data');

const API_BASE = 'https://api.bhavyabazaar.com';

console.log('🔍 Bhavya Bazaar API Endpoint Testing');
console.log('=====================================\n');

// Test data
const testUser = {
    name: 'Test User API',
    phoneNumber: '9876543210',
    password: 'testpass123'
};

const testSeller = {
    name: 'Test Seller API',
    phoneNumber: '9876543211', 
    password: 'testpass123',
    email: 'testseller@example.com',
    address: 'Test Address',
    zipCode: '123456'
};

async function testEndpoint(method, endpoint, data = null, headers = {}) {
    try {
        console.log(`🧪 Testing ${method.toUpperCase()} ${endpoint}`);
        
        const config = {
            method: method.toLowerCase(),
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 10000,
            validateStatus: () => true // Don't throw errors for any status code
        };
        
        if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
            config.data = data;
        }
        
        const response = await axios(config);
        
        console.log(`   Status: ${response.status}`);
        if (response.status >= 200 && response.status < 300) {
            console.log(`   ✅ Success`);
        } else if (response.status === 400 || response.status === 401) {
            console.log(`   ⚠️  Expected error (${response.data?.message || 'No message'})`);
        } else {
            console.log(`   ❌ Error: ${response.data?.message || response.statusText}`);
        }
        
        return response;
    } catch (error) {
        console.log(`   ❌ Network Error: ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('📡 Testing Core API Health');
    console.log('---------------------------');
    await testEndpoint('GET', '/');
    await testEndpoint('GET', '/api/v2/health');
    
    console.log('\n👤 Testing User Endpoints');
    console.log('-------------------------');
    
    // Test user registration with proper data
    const registrationData = new FormData();
    registrationData.append('name', testUser.name);
    registrationData.append('phoneNumber', testUser.phoneNumber);
    registrationData.append('password', testUser.password);
    
    await testEndpoint('POST', '/api/v2/user/create-user', testUser);
    await testEndpoint('POST', '/api/v2/user/login-user', {
        phoneNumber: testUser.phoneNumber,
        password: testUser.password
    });
    
    // Test protected endpoints (should return 401 without auth)
    await testEndpoint('GET', '/api/v2/user/getuser');
    await testEndpoint('PUT', '/api/v2/user/update-user-info', {
        name: 'Updated Name',
        email: 'updated@example.com'
    });
    
    console.log('\n🏪 Testing Shop Endpoints');
    console.log('-------------------------');
    await testEndpoint('POST', '/api/v2/shop/create-shop', testSeller);
    await testEndpoint('POST', '/api/v2/shop/login-shop', {
        email: testSeller.email,
        password: testSeller.password
    });
    await testEndpoint('GET', '/api/v2/shop/getSeller');
    
    console.log('\n📦 Testing Product Endpoints');
    console.log('----------------------------');
    await testEndpoint('GET', '/api/v2/product/get-all-products');
    await testEndpoint('GET', '/api/v2/product/get-all-products/1'); // Invalid shop ID
    
    console.log('\n🛒 Testing Order Endpoints');
    console.log('--------------------------');
    await testEndpoint('GET', '/api/v2/order/get-all-orders/1'); // Should require auth
    
    console.log('\n🎉 Testing Event Endpoints');
    console.log('--------------------------');
    await testEndpoint('GET', '/api/v2/event/get-all-events');
    
    console.log('\n💬 Testing Message/Conversation Endpoints');
    console.log('------------------------------------------');
    await testEndpoint('GET', '/api/v2/conversation/get-all-conversation-seller/1');
    await testEndpoint('GET', '/api/v2/message/get-all-messages/1');
    
    console.log('\n📊 Summary');
    console.log('----------');
    console.log('✅ All endpoints tested');
    console.log('⚠️  401/400 errors are expected for protected/invalid endpoints');
    console.log('❌ 500 errors or network failures should be investigated');
    console.log('🔧 Check server logs for detailed error information');
}

runTests().catch(console.error);
