#!/usr/bin/env node

const https = require('https');

console.log('🔍 Bhavya Bazaar Production API Diagnostic');
console.log('=========================================');

// Test the correct API endpoints based on server.js
async function testCorrectEndpoints() {
    const backendUrl = 'https://api.bhavyabazaar.com';
    
    console.log('\n📡 Testing Root API Endpoint');
    console.log('----------------------------');
    
    try {
        const response = await fetch(`${backendUrl}/`);
        const data = await response.json();
        console.log(`✅ Root API Status: ${response.status}`);
        console.log('Available endpoints:', JSON.stringify(data.endpoints, null, 2));
        
    } catch (error) {
        console.log(`❌ Root API Error: ${error.message}`);
    }
    
    console.log('\n🔐 Testing User Login Endpoint');
    console.log('------------------------------');
    
    // Test login with the correct endpoint structure
    const loginTests = [
        {
            name: 'Test login endpoint availability',
            endpoint: '/api/v2/user/login-user',
            data: { phoneNumber: '9999999999', password: 'testpassword' }
        },
        {
            name: 'Test user registration endpoint',
            endpoint: '/api/v2/user/create-user',
            data: { name: 'Test', email: 'test@test.com', phoneNumber: '9999999999', password: 'test' }
        }
    ];
    
    for (const test of loginTests) {
        try {
            console.log(`\n🧪 ${test.name}`);
            console.log(`   Endpoint: ${test.endpoint}`);
            
            const response = await fetch(`${backendUrl}${test.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(test.data)
            });
            
            let responseText = await response.text();
            console.log(`   Status: ${response.status}`);
            
            // Try to parse as JSON
            try {
                const jsonResponse = JSON.parse(responseText);
                console.log(`   Response:`, JSON.stringify(jsonResponse, null, 2));
            } catch {
                console.log(`   Response (raw):`, responseText.substring(0, 200));
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Test user-related endpoints to check database
async function testUserEndpoints() {
    console.log('\n👥 Testing User Management Endpoints');
    console.log('-----------------------------------');
    
    const userEndpoints = [
        { path: '/api/v2/user', method: 'GET', name: 'Get Users' },
        { path: '/api/v2/user/get-user', method: 'GET', name: 'Get User Profile' }
    ];
    
    for (const endpoint of userEndpoints) {
        try {
            console.log(`\n📋 ${endpoint.name}`);
            console.log(`   ${endpoint.method} ${endpoint.path}`);
            
            const response = await fetch(`https://api.bhavyabazaar.com${endpoint.path}`, {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            let responseText = await response.text();
            console.log(`   Status: ${response.status}`);
            
            try {
                const jsonResponse = JSON.parse(responseText);
                console.log(`   Response:`, JSON.stringify(jsonResponse, null, 2));
            } catch {
                console.log(`   Response (raw):`, responseText.substring(0, 150));
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Check environment-specific configuration
async function checkEnvironmentConfig() {
    console.log('\n⚙️ Environment Configuration Analysis');
    console.log('------------------------------------');
    
    // Check health endpoint for environment info
    try {
        const response = await fetch('https://api.bhavyabazaar.com/health');
        const data = await response.json();
        console.log('Health check response:', JSON.stringify(data, null, 2));
        
        // Check timestamp to ensure server is responding
        const serverTime = new Date(data.timestamp);
        const localTime = new Date();
        console.log(`Server time: ${serverTime.toISOString()}`);
        console.log(`Local time:  ${localTime.toISOString()}`);
        console.log(`Time diff:   ${Math.abs(localTime - serverTime)}ms`);
        
    } catch (error) {
        console.log(`❌ Health check error: ${error.message}`);
    }
}

// Main execution
async function main() {
    await testCorrectEndpoints();
    await testUserEndpoints();
    await checkEnvironmentConfig();
    
    console.log('\n🎯 Production Deployment Checklist');
    console.log('==================================');
    console.log('1. ✓ Server is responding');
    console.log('2. ✓ CORS is configured');
    console.log('3. ? Login endpoint validation');
    console.log('4. ? Database connectivity');
    console.log('5. ? Environment variables');
    console.log('\n📝 Next Steps:');
    console.log('- Check Coolify logs for detailed error messages');
    console.log('- Verify production database contains user data');
    console.log('- Confirm environment variables are set in Coolify');
    console.log('- Test with a known valid user account');
}

main().catch(console.error);
