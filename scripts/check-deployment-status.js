const https = require('https');

console.log('🔍 DEPLOYMENT STATUS CHECK');
console.log('========================');

const endpoints = [
    'https://bhavyabazaar.com',
    'https://api.bhavyabazaar.com',
    'https://api.bhavyabazaar.com/api/health',
    'https://api.bhavyabazaar.com/api/v2/health',
    'https://api.bhavyabazaar.com/api/v2/debug/env'
];

async function checkEndpoint(url) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const req = https.get(url, (res) => {
            const responseTime = Date.now() - startTime;
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    url,
                    status: res.statusCode,
                    headers: res.headers,
                    responseTime,
                    data: data.length > 200 ? data.substring(0, 200) + '...' : data
                });
            });
        });
        
        req.on('error', (error) => {
            resolve({
                url,
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                url,
                error: 'Timeout',
                responseTime: Date.now() - startTime
            });
        });
    });
}

async function checkAll() {
    console.log('Testing endpoints...\n');
    
    for (const url of endpoints) {
        console.log(`📡 Testing: ${url}`);
        const result = await checkEndpoint(url);
        
        if (result.error) {
            console.log(`❌ Error: ${result.error} (${result.responseTime}ms)`);
        } else {
            console.log(`✅ Status: ${result.status} (${result.responseTime}ms)`);
            if (result.status === 200 && result.data) {
                console.log(`📄 Response preview: ${result.data.substring(0, 100)}...`);
            }
        }
        console.log('');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Check Coolify deployment logs');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Check if services are running and healthy');
    console.log('4. Ensure domain DNS is pointing correctly');
    console.log('5. Check if there are any startup errors in the logs');
}

checkAll().catch(console.error);
