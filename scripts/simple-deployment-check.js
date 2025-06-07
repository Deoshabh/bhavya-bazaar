#!/usr/bin/env node

/**
 * Simple Deployment Check for Bhavya Bazaar
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BHAVYA BAZAAR DEPLOYMENT CHECK');
console.log('=================================\n');

function checkLocalCode() {
  console.log('📋 LOCAL CODE ANALYSIS');
  console.log('----------------------');
  
  try {
    const serverJsPath = path.join(__dirname, '../backend/server.js');
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');
    
    // Check for key fixes
    const checks = [
      {
        name: 'Debug endpoint (/api/v2/debug/env)',
        test: () => serverJs.includes('/api/v2/debug/env'),
        fix: 'Debug endpoint for environment checking'
      },
      {
        name: 'Redis health fix (no getHealthStatus)',
        test: () => !serverJs.includes('redisHealth.getHealthStatus'),
        fix: 'Removed old Redis health function call'
      },
      {
        name: 'WebSocket server setup',
        test: () => serverJs.includes('WebSocketServer') && serverJs.includes('path: "/ws"'),
        fix: 'WebSocket server with /ws path'
      },
      {
        name: 'Port configuration (default 8000)',
        test: () => {
          const match = serverJs.match(/const port = process\.env\.PORT \|\| (\d+)/);
          return match && match[1] === '8000';
        },
        fix: 'Default port set to 8000'
      },
      {
        name: 'Production CORS fix',
        test: () => {
          const corsSection = serverJs.match(/origin:\s*([^}]+)/s);
          return corsSection && corsSection[1].includes('process.env.NODE_ENV === "production"');
        },
        fix: 'CORS configured for production'
      }
    ];
    
    checks.forEach(check => {
      const result = check.test();
      console.log(`   ${check.name}: ${result ? '✅' : '❌'}`);
      if (!result) {
        console.log(`      → ${check.fix}`);
      }
    });
    
    return checks.every(check => check.test());
    
  } catch (error) {
    console.log('❌ Error reading server.js:', error.message);
    return false;
  }
}

function suggestNextSteps(allFixesPresent) {
  console.log('\n🔧 NEXT STEPS');
  console.log('=============');
  
  if (allFixesPresent) {
    console.log('✅ All fixes are present in local code!');
    console.log('\n📤 DEPLOYMENT STEPS:');
    console.log('1. Commit all changes to git');
    console.log('2. Push to your repository');
    console.log('3. In Coolify panel:');
    console.log('   - Go to your backend service');
    console.log('   - Click "Deploy" or trigger rebuild');
    console.log('   - Check build logs for errors');
    console.log('   - Verify PORT environment variable is set to 8000');
    console.log('4. Test endpoints after deployment');
  } else {
    console.log('❌ Some fixes are missing in local code');
    console.log('\n🛠️  REQUIRED ACTIONS:');
    console.log('1. Apply the missing fixes shown above');
    console.log('2. Test locally first');
    console.log('3. Then follow deployment steps');
  }
  
  console.log('\n🧪 TESTING COMMANDS:');
  console.log('• Run diagnostic: node scripts/production-diagnostic.js');
  console.log('• Test locally: npm run dev (in backend folder)');
  console.log('• Check logs: View Coolify service logs');
}

// Run the check
const allGood = checkLocalCode();
suggestNextSteps(allGood);

console.log('\n📞 CURRENT STATUS:');
console.log('• Backend endpoint: https://api.bhavyabazaar.com/api/v2/health');
console.log('• Frontend: https://bhavyabazaar.com');
console.log('• WebSocket: wss://api.bhavyabazaar.com/ws');
