// Create admin user via production API
const https = require('https');

console.log('🚀 Script started...');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (postData) req.write(postData);
        req.end();
    });
}

async function createAdminUser() {
    console.log('🚀 Creating Admin User in Production Database');
    console.log('=============================================\n');
    
    // Step 1: Create user via API
    console.log('👤 Creating user via /api/v2/user/create-user...');
    
    const userData = JSON.stringify({
        name: 'Super Admin',
        phoneNumber: '1234567890',
        password: 'admin123'
    });
    
    const createOptions = {
        hostname: 'api.bhavyabazaar.com',
        port: 443,
        path: '/api/v2/user/create-user',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': userData.length
        },
        timeout: 15000
    };
    
    try {
        const createResult = await makeRequest(createOptions, userData);
        console.log(`📥 Create Response Status: ${createResult.statusCode}`);
        console.log('📥 Create Response:', JSON.stringify(createResult.data, null, 2));
        
        if (createResult.data.success) {
            console.log('✅ User created successfully!');
            
            // Step 2: Test login
            console.log('\n🔐 Testing login with created user...');
            
            const loginData = JSON.stringify({
                phoneNumber: '1234567890',
                password: 'admin123'
            });
            
            const loginOptions = {
                hostname: 'api.bhavyabazaar.com',
                port: 443,
                path: '/api/v2/user/login-user',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': loginData.length
                },
                timeout: 15000
            };
            
            const loginResult = await makeRequest(loginOptions, loginData);
            console.log(`📥 Login Response Status: ${loginResult.statusCode}`);
            console.log('📥 Login Response:', JSON.stringify(loginResult.data, null, 2));
            
            if (loginResult.data.success) {
                console.log('✅ Login successful!');
                
                const user = loginResult.data.user;
                console.log('📋 User Details:', {
                    id: user._id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    role: user.role || 'undefined'
                });
                
                if (user.role === 'Admin' || user.role === 'admin') {
                    console.log('\n🎉 SUCCESS: User already has admin role!');
                    console.log('🔗 Admin Login URL: https://bhavyabazaar.com/admin-login');
                } else {
                    console.log('\n⚠️  User created but needs admin role');
                    console.log('💡 Manual intervention required to set role to "Admin"');
                    console.log('🔧 You may need to update the database directly');
                }
                
                return user;
            } else {
                console.log('❌ Login failed after user creation');
                return null;
            }
        } else {
            if (createResult.data.message && createResult.data.message.includes('already exists')) {
                console.log('📱 User already exists, testing login...');
                
                const loginData = JSON.stringify({
                    phoneNumber: '1234567890',
                    password: 'admin123'
                });
                
                const loginOptions = {
                    hostname: 'api.bhavyabazaar.com',
                    port: 443,
                    path: '/api/v2/user/login-user',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': loginData.length
                    },
                    timeout: 15000
                };
                
                const loginResult = await makeRequest(loginOptions, loginData);
                
                if (loginResult.data.success) {
                    console.log('✅ Existing user login successful!');
                    return loginResult.data.user;
                } else {
                    console.log('❌ Existing user login failed - may need password reset');
                    return null;
                }
            } else {
                console.log('❌ User creation failed:', createResult.data.message);
                return null;
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Main execution
createAdminUser().then((user) => {
    if (user) {
        console.log('\n📋 SUMMARY');
        console.log('==========');
        console.log('✅ User exists in production database');
        console.log('📞 Phone: 1234567890');
        console.log('🔑 Password: admin123');
        console.log('👤 Role:', user.role || 'undefined');
        console.log('🔗 Login URL: https://bhavyabazaar.com/login');
        
        if (user.role === 'Admin' || user.role === 'admin') {
            console.log('🎉 Admin login should work at: https://bhavyabazaar.com/admin-login');
        } else {
            console.log('⚠️  Need to update user role to "Admin" in database');
        }
    } else {
        console.log('\n❌ Failed to create/verify admin user');
    }
    
    process.exit(0);
}).catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
});
