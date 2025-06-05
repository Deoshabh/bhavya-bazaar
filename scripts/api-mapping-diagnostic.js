#!/usr/bin/env node

console.log('🔧 API Endpoint Mapping Diagnostic');
console.log('==================================');

// Test all the failing endpoints mentioned in the error
const API_BASE = 'https://api.bhavyabazaar.com';
const API_V2_BASE = 'https://api.bhavyabazaar.com/api/v2';

const FAILING_ENDPOINTS = [
    // From error messages - these are failing
    { 
        failing: `${API_BASE}/product/get-all-products`,
        correct: `${API_V2_BASE}/product/get-all-products`,
        name: 'Get All Products'
    },
    { 
        failing: `${API_BASE}/event/get-all-events`,
        correct: `${API_V2_BASE}/event/get-all-events`, 
        name: 'Get All Events'
    },
    { 
        failing: `${API_BASE}/shop/getSeller`,
        correct: `${API_V2_BASE}/shop/getSeller`,
        name: 'Get Seller Info'
    },
    { 
        failing: `${API_BASE}/user/login-user`,
        correct: `${API_V2_BASE}/user/login-user`,
        name: 'User Login'
    }
];

async function testEndpointMappings() {
    console.log('\n📍 Testing Failing vs Correct Endpoints');
    console.log('---------------------------------------');
    
    for (const endpoint of FAILING_ENDPOINTS) {
        console.log(`\n🔍 Testing: ${endpoint.name}`);
        console.log(`❌ Failing URL: ${endpoint.failing}`);
        console.log(`✅ Correct URL: ${endpoint.correct}`);
        
        // Test the failing endpoint
        try {
            const failingResponse = await fetch(endpoint.failing);
            console.log(`   Failing Status: ${failingResponse.status}`);
        } catch (error) {
            console.log(`   Failing Error: ${error.message}`);
        }
        
        // Test the correct endpoint
        try {
            const correctResponse = await fetch(endpoint.correct);
            console.log(`   Correct Status: ${correctResponse.status}`);
            
            if (correctResponse.status === 200) {
                console.log(`   ✅ Correct endpoint is working!`);
            } else if (correctResponse.status === 401) {
                console.log(`   ✅ Correct endpoint exists (needs auth)`);
            } else if (correctResponse.status === 404) {
                console.log(`   ❌ Correct endpoint also returns 404 - check backend routes`);
            }
        } catch (error) {
            console.log(`   Correct Error: ${error.message}`);
        }
    }
}

async function checkAvailableRoutes() {
    console.log('\n📋 Available Backend Routes');
    console.log('---------------------------');
    
    try {
        const response = await fetch(`${API_BASE}/`);
        const data = await response.json();
        
        console.log('Available route prefixes:', JSON.stringify(data.endpoints, null, 2));
        
        // Test each route prefix
        if (data.endpoints) {
            for (const [routeName, routePath] of Object.entries(data.endpoints)) {
                console.log(`\n🛣️  Testing route: ${routeName} -> ${routePath}`);
                
                try {
                    const routeResponse = await fetch(`${API_BASE}${routePath}`);
                    console.log(`   Status: ${routeResponse.status}`);
                } catch (error) {
                    console.log(`   Error: ${error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.log(`Error getting routes: ${error.message}`);
    }
}

async function checkSpecificEndpoints() {
    console.log('\n🎯 Testing Specific Backend Endpoints');
    console.log('------------------------------------');
    
    const endpointsToTest = [
        '/api/v2/product/get-all-products',
        '/api/v2/event/get-all-events',
        '/api/v2/shop/getSeller',
        '/api/v2/user/login-user'
    ];
    
    for (const endpoint of endpointsToTest) {
        try {
            console.log(`\n🧪 Testing: ${endpoint}`);
            const response = await fetch(`${API_BASE}${endpoint}`);
            console.log(`   Status: ${response.status}`);
            
            if (response.status === 404) {
                console.log(`   ❌ Route does not exist on backend`);
            } else if (response.status === 401) {
                console.log(`   ✅ Route exists but requires authentication`);
            } else if (response.status === 200) {
                console.log(`   ✅ Route is working`);
            } else {
                console.log(`   ⚠️  Unexpected status: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`   Error: ${error.message}`);
        }
    }
}

async function main() {
    await testEndpointMappings();
    await checkAvailableRoutes();
    await checkSpecificEndpoints();
    
    console.log('\n💡 Diagnosis Summary');
    console.log('===================');
    console.log('The frontend is making API calls without the /api/v2 prefix.');
    console.log('This suggests the frontend configuration needs to be updated.');
    console.log('');
    console.log('🔧 Solutions:');
    console.log('1. Check frontend API configuration in src/server.js');
    console.log('2. Verify all API calls use the correct base URL');
    console.log('3. Update any hardcoded API endpoints');
    console.log('4. Check backend routes match expected frontend calls');
}

main().catch(console.error);
