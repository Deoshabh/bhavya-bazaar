// Simple test of production API
const https = require('https');

const testData = JSON.stringify({
    phoneNumber: '1234567890',
    password: 'admin123'
});

const options = {
    hostname: 'api.bhavyabazaar.com',
    port: 443,
    path: '/api/v2/user/login-user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    },
    timeout: 10000
};

console.log('Testing production API...');
console.log('Making request to:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (err) => {
    console.error('Request error:', err.message);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('Request timeout');
    req.destroy();
    process.exit(1);
});

req.write(testData);
req.end();
