// Performance monitoring and optimization test script
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.bhavyabazaar.com/api/v2';
const FRONTEND_BASE = 'https://bhavyabazaar.com';

console.log('🔍 Bhavya Bazaar Performance Analysis Report');
console.log('='.repeat(50));

async function testPerformance() {
  const results = {
    api: {},
    frontend: {},
    assets: {},
    recommendations: []
  };

  // 1. Test API Response Times
  console.log('\n📡 Testing API Performance...');
  const apiEndpoints = [
    '/product/get-all-products',
    '/shop/get-all-shops', 
    '/event/get-all-events',
    '/user/getuser'
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const start = Date.now();
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bhavya-Bazaar-Performance-Test'
        }
      });
      const duration = Date.now() - start;
      
      results.api[endpoint] = {
        status: response.status,
        duration: `${duration}ms`,
        size: response.headers['content-length'] || 'unknown',
        success: true
      };
      
      console.log(`  ✅ ${endpoint}: ${duration}ms (${response.status})`);
      
      if (duration > 2000) {
        results.recommendations.push(`Optimize ${endpoint} - response time is ${duration}ms`);
      }
      
    } catch (error) {
      results.api[endpoint] = {
        error: error.message,
        success: false
      };
      console.log(`  ❌ ${endpoint}: ${error.message}`);
    }
  }

  // 2. Test Frontend Assets
  console.log('\n🌐 Testing Frontend Assets...');
  const assetTests = [
    { name: 'Main Page', url: FRONTEND_BASE },
    { name: 'Favicon', url: `${FRONTEND_BASE}/favicon.ico` },
    { name: '404 Page', url: `${FRONTEND_BASE}/404.html` },
    { name: 'Main JS Bundle', url: `${FRONTEND_BASE}/static/js/main.*.js` },
    { name: 'Runtime Config', url: `${FRONTEND_BASE}/runtime-config.js` }
  ];

  for (const test of assetTests) {
    try {
      const start = Date.now();
      const response = await axios.get(test.url, {
        timeout: 10000,
        maxRedirects: 5
      });
      const duration = Date.now() - start;
      const size = response.headers['content-length'] || response.data.length;
      
      results.frontend[test.name] = {
        status: response.status,
        duration: `${duration}ms`,
        size: `${Math.round(size / 1024)}KB`,
        gzipped: response.headers['content-encoding'] === 'gzip',
        success: true
      };
      
      console.log(`  ✅ ${test.name}: ${duration}ms, ${Math.round(size / 1024)}KB`);
      
      // Check for large assets
      if (size > 1024 * 1024) { // > 1MB
        results.recommendations.push(`Large asset detected: ${test.name} (${Math.round(size / 1024 / 1024)}MB)`);
      }
      
    } catch (error) {
      results.frontend[test.name] = {
        error: error.message,
        success: false
      };
      console.log(`  ❌ ${test.name}: ${error.message}`);
    }
  }

  // 3. Test Critical User Flows
  console.log('\n🛒 Testing Critical User Flows...');
  const criticalFlows = [
    { name: 'Products Page', url: `${FRONTEND_BASE}/products` },
    { name: 'Best Selling', url: `${FRONTEND_BASE}/best-selling` },
    { name: 'Events Page', url: `${FRONTEND_BASE}/events` },
    { name: 'FAQ Page', url: `${FRONTEND_BASE}/faq` }
  ];

  for (const flow of criticalFlows) {
    try {
      const start = Date.now();
      const response = await axios.get(flow.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const duration = Date.now() - start;
      
      results.assets[flow.name] = {
        status: response.status,
        duration: `${duration}ms`,
        loadTime: duration < 3000 ? 'Good' : duration < 5000 ? 'Fair' : 'Poor',
        success: true
      };
      
      console.log(`  ✅ ${flow.name}: ${duration}ms (${duration < 3000 ? 'Good' : 'Needs Optimization'})`);
      
    } catch (error) {
      results.assets[flow.name] = {
        error: error.message,
        success: false
      };
      console.log(`  ❌ ${flow.name}: ${error.message}`);
    }
  }

  // 4. Generate Performance Report
  console.log('\n📊 Performance Analysis Complete!');
  console.log('='.repeat(50));

  // Calculate performance score
  const totalTests = Object.keys(results.api).length + 
                    Object.keys(results.frontend).length + 
                    Object.keys(results.assets).length;
  const successfulTests = Object.values(results.api).filter(r => r.success).length +
                         Object.values(results.frontend).filter(r => r.success).length +
                         Object.values(results.assets).filter(r => r.success).length;
  
  const performanceScore = Math.round((successfulTests / totalTests) * 100);
  
  console.log(`\n🎯 Overall Performance Score: ${performanceScore}%`);
  
  if (performanceScore >= 90) {
    console.log('🟢 Excellent performance!');
  } else if (performanceScore >= 80) {
    console.log('🟡 Good performance with room for improvement');
  } else {
    console.log('🔴 Performance needs attention');
  }

  // 5. Recommendations
  if (results.recommendations.length > 0) {
    console.log('\n💡 Performance Recommendations:');
    results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  // 6. Save detailed report
  const reportPath = path.join(__dirname, '..', 'PERFORMANCE-ANALYSIS-REPORT.md');
  const reportContent = generateMarkdownReport(results, performanceScore);
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`\n📝 Detailed report saved to: ${reportPath}`);
  
  return results;
}

function generateMarkdownReport(results, score) {
  const timestamp = new Date().toISOString();
  
  return `# Bhavya Bazaar Performance Analysis Report

**Generated:** ${timestamp}  
**Overall Score:** ${score}%

## API Performance Results

| Endpoint | Status | Duration | Size | Success |
|----------|--------|----------|------|---------|
${Object.entries(results.api).map(([endpoint, data]) => 
  `| ${endpoint} | ${data.status || 'Error'} | ${data.duration || 'N/A'} | ${data.size || 'N/A'} | ${data.success ? '✅' : '❌'} |`
).join('\n')}

## Frontend Asset Performance

| Asset | Status | Duration | Size | Gzipped | Success |
|-------|--------|----------|------|---------|---------|
${Object.entries(results.frontend).map(([name, data]) => 
  `| ${name} | ${data.status || 'Error'} | ${data.duration || 'N/A'} | ${data.size || 'N/A'} | ${data.gzipped ? '✅' : '❌'} | ${data.success ? '✅' : '❌'} |`
).join('\n')}

## Critical User Flow Performance

| Flow | Status | Duration | Load Time | Success |
|------|--------|----------|-----------|---------|
${Object.entries(results.assets).map(([name, data]) => 
  `| ${name} | ${data.status || 'Error'} | ${data.duration || 'N/A'} | ${data.loadTime || 'N/A'} | ${data.success ? '✅' : '❌'} |`
).join('\n')}

## Recommendations

${results.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Next Steps

1. **Bundle Optimization**: Consider code splitting for large JavaScript bundles
2. **Image Optimization**: Implement WebP format and responsive images  
3. **Caching Strategy**: Ensure proper cache headers for static assets
4. **CDN Implementation**: Consider using a CDN for global asset delivery
5. **Database Optimization**: Optimize API response times for data-heavy endpoints

---
*Report generated by Bhavya Bazaar Performance Monitoring System*
`;
}

// Run the performance test
if (require.main === module) {
  testPerformance().catch(console.error);
}

module.exports = { testPerformance };
