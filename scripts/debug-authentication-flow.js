const https = require('https');

async function debugAuthenticationFlow() {
    console.log('🔍 DEBUGGING AUTHENTICATION FLOW');
    console.log('===================================');
    
    console.log('\n1. Testing /getuser endpoint with different scenarios...');
    
    // Test 1: Call getuser without any cookies
    console.log('\nTest 1: No authentication');
    await makeRequest('/api/v2/user/getuser', {}, 'Should return 401 "Please login to continue"');
    
    // Test 2: Call getuser with invalid token
    console.log('\nTest 2: Invalid token');
    await makeRequest('/api/v2/user/getuser', {
        'Cookie': 'token=invalid_token_here'
    }, 'Should return 401 "Invalid token"');
    
    // Test 3: Check if we can see what cookies are being sent by browser
    console.log('\nTest 3: Check debug endpoint for more info');
    await makeRequest('/api/v2/debug/env', {}, 'Environment debug info');
    
    console.log('\n💡 ANALYSIS:');
    console.log('=============');
    console.log('If getuser returns 400 "User doesn\'t exist" instead of 401:');
    console.log('- The authentication middleware is working');
    console.log('- The token is valid and being decoded');
    console.log('- But the user ID from token doesn\'t exist in database');
    console.log('- This could mean user was deleted or token contains wrong ID');
}

async function makeRequest(path, headers = {}, description = '') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.bhavyabazaar.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Authentication-Debug-Tool',
                ...headers
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`📍 ${path}`);
                console.log(`📝 ${description}`);
                console.log(`🔢 Status: ${res.statusCode}`);
                console.log(`🍪 Set-Cookie: ${res.headers['set-cookie'] || 'None'}`);
                
                try {
                    const parsed = JSON.parse(data);
                    console.log(`📄 Response: ${JSON.stringify(parsed, null, 2)}`);
                } catch (e) {
                    console.log(`📄 Raw Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve();
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            console.log(`⏰ Request timeout`);
            resolve();
        });
        
        req.end();
    });
}

debugAuthenticationFlow().catch(console.error);
