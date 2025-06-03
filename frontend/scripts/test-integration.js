const https = require('https');

console.log('🧪 Testing Bhavya Bazaar API Integration...\n');

const testEndpoints = [
  { name: 'Health Check', path: '/api/v2/health' },
  { name: 'Get All Products', path: '/api/v2/product/get-all-products' },
  { name: 'Get All Events', path: '/api/v2/event/get-all-events' }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.bhavyabazaar.com',
      port: 443,
      path: endpoint.path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: response.success || res.statusCode === 200,
            dataSize: data.length
          });
        } catch (error) {
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: res.statusCode === 200,
            dataSize: data.length
          });
        }
      });
    });

    req.on('error', error => reject({ name: endpoint.name, error: error.message }));
    req.setTimeout(10000, () => req.abort());
    req.end();
  });
}

async function runTests() {
  let passed = 0;
  
  for (const endpoint of testEndpoints) {
    try {
      const result = await testEndpoint(endpoint);
      if (result.success) {
        console.log(`✅ ${result.name} - Status: ${result.status} - Data: ${result.dataSize} bytes`);
        passed++;
      } else {
        console.log(`❌ ${result.name} - Status: ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ ${error.name} - Error: ${error.error}`);
    }
  }
  
  console.log(`\n📊 Results: ${passed}/${testEndpoints.length} endpoints working`);
  console.log(passed === testEndpoints.length ? '🎉 ALL INTEGRATION TESTS PASSED!' : '⚠️  Some issues detected');
}

runTests();
