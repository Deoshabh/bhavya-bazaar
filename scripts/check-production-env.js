#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Checking Production Environment Configuration');
console.log('==============================================');

// Test environment endpoint
async function checkEnvironment() {
    const backendUrl = 'https://api.bhavyabazaar.com';
    
    // Create a test endpoint to check environment variables
    const testEndpoints = [
        '/api/v2/health',
        '/api/v2/test/env', // Custom endpoint to check env
    ];
    
    for (const endpoint of testEndpoints) {
        try {
            const url = `${backendUrl}${endpoint}`;
            console.log(`\n📡 Testing: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.text();
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${data.substring(0, 200)}...`);
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Check database connectivity by trying to access user data
async function checkDatabaseConnectivity() {
    console.log('\n🗄️ Testing Database Connectivity');
    console.log('--------------------------------');
    
    try {
        const response = await fetch('https://api.bhavyabazaar.com/api/v2/get-users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('✅ Database: Responding (authentication required)');
        } else if (response.status === 200) {
            console.log('⚠️ Database: Responding but may have auth issues');
        } else {
            console.log('❌ Database: Connection issues');
        }
        
    } catch (error) {
        console.log(`❌ Database Error: ${error.message}`);
    }
}

// Test login with various scenarios
async function testLoginScenarios() {
    console.log('\n🔐 Testing Login Scenarios');
    console.log('-------------------------');
    
    const loginTests = [
        {
            name: 'Empty credentials',
            data: { phoneNumber: '', password: '' }
        },
        {
            name: 'Invalid phone format',
            data: { phoneNumber: '123', password: 'test' }
        },
        {
            name: 'Valid format but non-existent user',
            data: { phoneNumber: '9999999999', password: 'testpassword' }
        }
    ];
    
    for (const test of loginTests) {
        try {
            console.log(`\n🧪 Test: ${test.name}`);
            
            const response = await fetch('https://api.bhavyabazaar.com/api/v2/login-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(test.data)
            });
            
            const data = await response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2));
            
        } catch (error) {
            console.log(`❌ Login Test Error: ${error.message}`);
        }
    }
}

// Main execution
async function main() {
    await checkEnvironment();
    await checkDatabaseConnectivity();
    await testLoginScenarios();
    
    console.log('\n📋 Key Issues to Check:');
    console.log('======================');
    console.log('1. NODE_ENV should be "production" in production');
    console.log('2. DB_URI should point to production MongoDB');
    console.log('3. JWT secrets should be production values');
    console.log('4. Check Coolify environment variables');
    console.log('5. Verify user data exists in production database');
}

main().catch(console.error);
