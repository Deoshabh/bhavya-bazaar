/**
 * Investigate Authentication Issue
 * 
 * This script helps debug the specific issue where:
 * - Auth middleware passes (token is valid)
 * - But /getuser returns 400 "User doesn't exist" instead of 401
 * 
 * Root cause: Token contains valid JWT but user ID doesn't exist in database
 */

const axios = require('axios');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';

async function investigateAuthIssue() {
    console.log('🔍 INVESTIGATING AUTHENTICATION ISSUE');
    console.log('=====================================');
    
    console.log('\n📋 Problem Summary:');
    console.log('- Frontend shows "User doesn\'t exist" error (400 status)');
    console.log('- Expected: "Please login to continue" error (401 status)');
    console.log('- This means: JWT token is valid but user ID not found in DB');
    
    console.log('\n🎯 Testing Theory:');
    console.log('1. Create a test user');
    console.log('2. Login to get a valid token');
    console.log('3. Delete the user from database');
    console.log('4. Try to access /getuser with the token');
    console.log('5. Should see "User doesn\'t exist" (reproducing the issue)');
    
    // Test 1: Check current /getuser behavior
    console.log('\n📍 Test 1: Check current /getuser behavior');
    try {
        const response = await axios.get(`${API_BASE}/user/getuser`, {
            timeout: 10000
        });
        console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
        console.log(`✅ Status: ${error.response?.status}`);
        console.log(`✅ Message: ${error.response?.data?.message}`);
        
        if (error.response?.status === 401) {
            console.log('✅ Correct behavior: Returns 401 for no token');
        } else if (error.response?.status === 400) {
            console.log('❌ Issue confirmed: Returns 400 instead of 401');
            console.log('   This means token exists but user not found in DB');
        }
    }
    
    // Test 2: Create a test user to verify the flow
    console.log('\n📍 Test 2: Create test user for investigation');
    const testUser = {
        name: 'Debug Test User',
        phoneNumber: '9999999999',
        password: 'debug123456'
    };
    
    try {
        const createResponse = await axios.post(`${API_BASE}/user/create-user`, testUser);
        if (createResponse.data.success) {
            console.log('✅ Test user created successfully');
            
            // Test 3: Login with test user
            console.log('\n📍 Test 3: Login with test user');
            try {
                const loginResponse = await axios.post(`${API_BASE}/user/login-user`, {
                    phoneNumber: testUser.phoneNumber,
                    password: testUser.password
                }, {
                    withCredentials: true
                });
                
                if (loginResponse.data.success) {
                    console.log('✅ Login successful');
                    
                    // Test 4: Access /getuser with valid token
                    console.log('\n📍 Test 4: Access /getuser with valid token');
                    try {
                        const userResponse = await axios.get(`${API_BASE}/user/getuser`, {
                            withCredentials: true
                        });
                        console.log('✅ User data retrieved successfully');
                        console.log('   User ID:', userResponse.data.user._id);
                    } catch (error) {
                        if (error.response?.status === 400) {
                            console.log('❌ Issue reproduced: Valid token but user not found');
                        } else {
                            console.log('🔄 Different error:', error.response?.data?.message);
                        }
                    }
                }
            } catch (loginError) {
                console.log('❌ Login failed:', loginError.response?.data?.message);
            }
        }
    } catch (createError) {
        if (createError.response?.data?.message?.includes('already exists')) {
            console.log('ℹ️ Test user already exists - this is fine for debugging');
        } else {
            console.log('❌ Failed to create test user:', createError.response?.data?.message);
        }
    }
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Check JWT tokens in browser cookies - may be stale');
    console.log('2. Clear browser cookies and login again');
    console.log('3. Verify user exists in database for token user ID');
    console.log('4. Add better error handling in /getuser endpoint');
    console.log('5. Consider invalidating old tokens when users are deleted');
    
    console.log('\n🌐 IMMEDIATE USER SOLUTION:');
    console.log('- Clear browser cookies/localStorage');
    console.log('- Login again to get fresh token');
    console.log('- This should resolve the authentication issue');
}

// Run the investigation
investigateAuthIssue()
    .then(() => {
        console.log('\n✅ Investigation completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Investigation failed:', error.message);
        process.exit(1);
    });
