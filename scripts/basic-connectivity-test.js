const https = require('https');

async function testBasicConnectivity() {
    console.log('🔍 BASIC CONNECTIVITY TEST');
    console.log('==========================');
    
    const tests = [
        {
            name: 'Frontend Root',
            url: 'https://bhavyabazaar.com',
            expected: 'HTML page'
        },
        {
            name: 'Backend Root', 
            url: 'https://api.bhavyabazaar.com',
            expected: 'JSON API info'
        },
        {
            name: 'Backend Root (with path)',
            url: 'https://api.bhavyabazaar.com/',
            expected: 'JSON API info'
        }
    ];
    
    for (const test of tests) {
        console.log(`\n📡 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        
        try {
            const result = await makeRequest(test.url);
            console.log(`✅ Status: ${result.statusCode}`);
            console.log(`📄 Content-Type: ${result.headers['content-type']}`);
            console.log(`📏 Content-Length: ${result.headers['content-length'] || 'unknown'}`);
            
            if (result.data) {
                const preview = result.data.substring(0, 200);
                console.log(`📝 Preview: ${preview}${result.data.length > 200 ? '...' : ''}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('=============');
    console.log('- If all tests fail with "404 page not found", the services may not be running');
    console.log('- If frontend works but backend fails, there may be a backend deployment issue');
    console.log('- If we get connection errors, there may be DNS or infrastructure issues');
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

testBasicConnectivity().catch(console.error);
