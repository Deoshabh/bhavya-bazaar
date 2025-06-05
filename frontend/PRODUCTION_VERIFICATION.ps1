# 🔍 Production Verification Script
# Run this in browser console to verify all fixes are working

Write-Host "🚀 Starting Bhavya Bazaar Production Verification..." -ForegroundColor Green
Write-Host "Testing on: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if production server is running
Write-Host "Step 1: Checking Production Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Production server is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Production server not accessible" -ForegroundColor Red
    Write-Host "Please run: npx serve -s build -p 3001" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🧪 Browser Console Tests to Run:" -ForegroundColor Green
Write-Host "Copy and paste these commands in your browser console at http://localhost:3001" -ForegroundColor Gray
Write-Host ""

Write-Host "=== TEST 1: Runtime Configuration ===" -ForegroundColor Cyan
Write-Host @"
// Check if runtime config is loaded
console.log('🔧 Runtime Config Test:');
console.log('window.__RUNTIME_CONFIG__:', window.__RUNTIME_CONFIG__);
console.log('window.RUNTIME_CONFIG:', window.RUNTIME_CONFIG);

// Verify specific values
if (window.__RUNTIME_CONFIG__) {
  console.log('✅ Runtime config loaded successfully');
  console.log('API_URL:', window.__RUNTIME_CONFIG__.API_URL);
  console.log('BACKEND_URL:', window.__RUNTIME_CONFIG__.BACKEND_URL);
  console.log('NODE_ENV:', window.__RUNTIME_CONFIG__.NODE_ENV);
} else {
  console.error('❌ Runtime config not loaded');
}
"@ -ForegroundColor White

Write-Host ""
Write-Host "=== TEST 2: Image URL Generation ===" -ForegroundColor Cyan
Write-Host @"
// Wait for app to load, then test image URL generation
setTimeout(() => {
  console.log('🖼️ Image URL Test:');
  
  // Test different filename patterns
  const testFiles = [
    'test-image.jpg',
    'Screenshot2025-05-30150431-1748597679849-377515787.png',
    '/uploads/test.jpg',
    ''
  ];
  
  if (typeof getImageUrl === 'function') {
    testFiles.forEach(file => {
      const result = getImageUrl(file);
      console.log(`'${file}' → '${result}'`);
      
      // Verify correct format
      if (file && result.startsWith('https://api.bhavyabazaar.com/uploads/')) {
        console.log('✅ Correct format');
      } else if (!file && result === '') {
        console.log('✅ Empty file handled correctly');
      } else {
        console.log('❌ Incorrect format');
      }
    });
  } else {
    console.error('❌ getImageUrl function not available');
  }
}, 3000);
"@ -ForegroundColor White

Write-Host ""
Write-Host "=== TEST 3: API Configuration ===" -ForegroundColor Cyan
Write-Host @"
// Test API configuration functions
setTimeout(() => {
  console.log('🌐 API Config Test:');
  
  if (typeof getApiDomain === 'function') {
    console.log('API Domain:', getApiDomain());
  }
  
  if (typeof getWebsocketUrl === 'function') {
    console.log('WebSocket URL:', getWebsocketUrl());
  }
  
  // Test API connectivity (basic ping)
  fetch(window.__RUNTIME_CONFIG__.API_URL.replace('/api/v2', '/health'))
    .then(response => {
      console.log('✅ API server reachable (Status:', response.status, ')');
    })
    .catch(error => {
      console.log('⚠️ API server not reachable:', error.message);
    });
}, 2000);
"@ -ForegroundColor White

Write-Host ""
Write-Host "=== TEST 4: Console Error Check ===" -ForegroundColor Cyan
Write-Host @"
// Check for any console errors
setTimeout(() => {
  console.log('🔍 Console Error Check:');
  
  // Override console.error to catch errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    if (errors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Console errors found:', errors);
    }
  }, 5000);
}, 1000);
"@ -ForegroundColor White

Write-Host ""
Write-Host "=== EXPECTED RESULTS ===" -ForegroundColor Magenta
Write-Host "✅ Runtime config loaded with production values" -ForegroundColor Green
Write-Host "✅ Image URLs format: https://api.bhavyabazaar.com/uploads/[filename]" -ForegroundColor Green
Write-Host "✅ API URL: https://api.bhavyabazaar.com/api/v2" -ForegroundColor Green
Write-Host "✅ No 'process is not defined' errors" -ForegroundColor Green
Write-Host "✅ No 'Cannot read properties of undefined' errors" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Open Browser Now:" -ForegroundColor Yellow
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Manual Checks:" -ForegroundColor Yellow
Write-Host "- Page loads without white screen" -ForegroundColor Gray
Write-Host "- No console errors on page load" -ForegroundColor Gray
Write-Host "- Images display correctly (if any)" -ForegroundColor Gray
Write-Host "- Navigation works properly" -ForegroundColor Gray
