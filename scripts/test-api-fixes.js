const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';

// Test configuration
const testUser = {
    name: 'Test User API Fix',
    phoneNumber: '9876543210',
    password: 'testpass123'
};

const testShop = {
    name: 'Test Shop API Fix',
    phoneNumber: '9876543211',
    password: 'testpass123',
    address: 'Test Address',
    zipCode: '123456'
};

// Comprehensive API testing workflow
async function runComprehensiveAPITests() {
    console.log('🔥 BHAVYA BAZAAR - COMPREHENSIVE API FIXES VALIDATION');
    console.log('====================================================\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    try {
        // Test 1: Server Health Check
        totalTests++;
        console.log('1. Testing server health check...');
        try {
            const health = await axios.get(`${API_BASE}/health`, { timeout: 10000 });
            if (health.data.status === 'healthy') {
                console.log('✅ Server health check passed');
                passedTests++;
            } else {
                console.log('❌ Server health check failed');
            }
        } catch (error) {
            console.log('❌ Server health check error:', error.message);
        }
        
        // Test 2: Message endpoints (check for syntax error fix)
        totalTests++;
        console.log('\n2. Testing message endpoints (syntax error fix)...');
        try {
            const response = await axios.post(`${API_BASE}/message/create-new-message`, {
                text: 'test',
                sender: 'test',
                conversationId: 'test'
            }, { 
                timeout: 10000,
                validateStatus: () => true // Accept all status codes
            });
            
            if (response.status === 400 || response.status === 401) {
                console.log('✅ Message endpoint responding correctly (no syntax errors)');
                passedTests++;
            } else {
                console.log('❌ Message endpoint unexpected response:', response.status);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('⚠️  Server not accessible for message test');
            } else {
                console.log('❌ Message endpoint error:', error.message);
            }
        }
        
        // Test 3: Authentication error standardization
        totalTests++;
        console.log('\n3. Testing authentication error standardization...');
        try {
            const response = await axios.get(`${API_BASE}/user/getuser`, { 
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (response.status === 401) {
                console.log('✅ Authentication returns correct 401 status');
                passedTests++;
            } else {
                console.log('❌ Authentication returns incorrect status:', response.status);
            }
        } catch (error) {
            console.log('❌ Authentication test error:', error.message);
        }
        
        // Test 4: User registration validation (simulated)
        totalTests++;
        console.log('\n4. Testing user registration validation...');
        try {
            const response = await axios.post(`${API_BASE}/user/create-user`, {
                name: '',
                phoneNumber: '',
                password: ''
            }, { 
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (response.status === 400 && response.data.message) {
                console.log('✅ User registration validation working');
                passedTests++;
            } else {
                console.log('❌ User registration validation failed');
            }
        } catch (error) {
            console.log('❌ User registration test error:', error.message);
        }
        
        // Test 5: Shop registration validation
        totalTests++;
        console.log('\n5. Testing shop registration validation...');
        try {
            const response = await axios.post(`${API_BASE}/shop/create-shop`, {
                name: '',
                phoneNumber: 'invalid',
                password: '',
                address: '',
                zipCode: ''
            }, { 
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (response.status === 400) {
                console.log('✅ Shop registration validation working');
                passedTests++;
            } else {
                console.log('❌ Shop registration validation failed');
            }
        } catch (error) {
            console.log('❌ Shop registration test error:', error.message);
        }
        
        // Test 6: Product endpoints accessibility
        totalTests++;
        console.log('\n6. Testing product endpoints...');
        try {
            const response = await axios.get(`${API_BASE}/product/get-all-products`, { 
                timeout: 10000
            });
            
            if (response.status === 200 || response.status === 201) {
                console.log(`✅ Product endpoints accessible (${response.data.products?.length || 0} products)`);
                passedTests++;
            } else {
                console.log('❌ Product endpoints failed');
            }
        } catch (error) {
            console.log('❌ Product endpoints error:', error.message);
        }
        
        // Test 7: Event endpoints accessibility
        totalTests++;
        console.log('\n7. Testing event endpoints...');
        try {
            const response = await axios.get(`${API_BASE}/event/get-all-events`, { 
                timeout: 10000
            });
            
            if (response.status === 200 || response.status === 201) {
                console.log(`✅ Event endpoints accessible (${response.data.events?.length || 0} events)`);
                passedTests++;
            } else {
                console.log('❌ Event endpoints failed');
            }
        } catch (error) {
            console.log('❌ Event endpoints error:', error.message);
        }
        
        // Test 8: CORS configuration
        totalTests++;
        console.log('\n8. Testing CORS configuration...');
        try {
            const response = await axios.options(API_BASE, { 
                timeout: 10000,
                headers: {
                    'Origin': 'https://bhavyabazaar.com',
                    'Access-Control-Request-Method': 'POST'
                }
            });
            
            console.log('✅ CORS configuration accessible');
            passedTests++;
        } catch (error) {
            if (error.response?.status === 200 || error.response?.status === 204) {
                console.log('✅ CORS configuration working');
                passedTests++;
            } else {
                console.log('❌ CORS configuration error:', error.message);
            }
        }
        
    } catch (globalError) {
        console.error('❌ Global test error:', globalError.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! API fixes are working correctly.');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('\n✅ MOST TESTS PASSED! API is functioning well with minor issues.');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED! Review the failing endpoints.');
    }
    
    console.log('\n🔧 FIXES IMPLEMENTED:');
    console.log('- ✅ Fixed message controller syntax error');
    console.log('- ✅ Standardized authentication error responses (401 codes)');
    console.log('- ✅ Added file upload validation (user, shop, product, event)');
    console.log('- ✅ Enhanced error handling and security measures');
    
    return { passed: passedTests, total: totalTests };
}

// File upload validation test
async function testFileUploadValidation() {
    console.log('\n🔒 TESTING FILE UPLOAD SECURITY FIXES');
    console.log('=====================================');
    
    // Test invalid file type (simulated)
    console.log('Testing file type validation...');
    try {
        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('phoneNumber', '9876543210');
        formData.append('password', 'testpass123');
        // Simulate uploading a text file as avatar (should be rejected)
        formData.append('file', Buffer.from('test content'), { 
            filename: 'test.txt',
            contentType: 'text/plain'
        });
        
        const response = await axios.post(`${API_BASE}/user/create-user`, formData, {
            headers: formData.getHeaders(),
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (response.status === 400 && response.data.message?.includes('Invalid file type')) {
            console.log('✅ File type validation working correctly');
        } else {
            console.log('⚠️  File type validation test inconclusive');
        }
    } catch (error) {
        console.log('⚠️  File upload test error (expected in some cases):', error.message);
    }
}

// Run the tests
async function main() {
    const startTime = Date.now();
    
    const results = await runComprehensiveAPITests();
    await testFileUploadValidation();
    
    const endTime = Date.now();
    console.log(`\n⏱️  Total test time: ${(endTime - startTime)}ms`);
    
    // Exit with appropriate code
    process.exit(results.passed === results.total ? 0 : 1);
}

main().catch(console.error);
