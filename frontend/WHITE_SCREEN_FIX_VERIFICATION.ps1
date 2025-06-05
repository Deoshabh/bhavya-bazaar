# 🔍 Runtime Config Verification Test
# Run this in the browser console to verify our fixes

Write-Host "🧪 Testing Runtime Configuration and Image URL Generation..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if runtime config is loaded
Write-Host "Test 1: Runtime Configuration Accessibility" -ForegroundColor Yellow
Write-Host "Expected: Both window.__RUNTIME_CONFIG__ and window.RUNTIME_CONFIG should be available" -ForegroundColor Gray
Write-Host ""

# Test 2: Verify API URLs are properly formatted
Write-Host "Test 2: API URL Configuration" -ForegroundColor Yellow
Write-Host "Expected API URL: https://api.bhavyabazaar.com/api/v2" -ForegroundColor Gray
Write-Host "Expected Backend URL: https://api.bhavyabazaar.com" -ForegroundColor Gray
Write-Host ""

# Test 3: Image URL Generation
Write-Host "Test 3: Image URL Generation Test" -ForegroundColor Yellow
Write-Host "Testing various filename patterns..." -ForegroundColor Gray

$testFilenames = @(
    "test-image.jpg",
    "/test-image.jpg",
    "uploads/test-image.jpg", 
    "Screenshot2025-05-30150431-1748597679849-377515787.png",
    ""
)

foreach ($filename in $testFilenames) {
    if ($filename -eq "") {
        Write-Host "  Empty filename → Should return empty string" -ForegroundColor Gray
    } else {
        Write-Host "  '$filename' → Should return 'https://api.bhavyabazaar.com/uploads/[clean-filename]'" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔧 Browser Console Commands to Run:" -ForegroundColor Green
Write-Host ""
Write-Host "// 1. Check runtime config" -ForegroundColor White
Write-Host "console.log('Runtime Config:', window.__RUNTIME_CONFIG__);" -ForegroundColor White
Write-Host "console.log('Backward Compatibility:', window.RUNTIME_CONFIG);" -ForegroundColor White
Write-Host ""
Write-Host "// 2. Test API URL access" -ForegroundColor White
Write-Host "console.log('API URL:', window.__RUNTIME_CONFIG__?.API_URL);" -ForegroundColor White
Write-Host "console.log('Backend URL:', window.__RUNTIME_CONFIG__?.BACKEND_URL);" -ForegroundColor White
Write-Host ""
Write-Host "// 3. Wait for app to load and test getImageUrl" -ForegroundColor White
Write-Host "setTimeout(() => {" -ForegroundColor White
Write-Host "  if (window.getImageUrl) {" -ForegroundColor White
Write-Host "    console.log('getImageUrl test:', window.getImageUrl('test-image.jpg'));" -ForegroundColor White
Write-Host "  } else {" -ForegroundColor White
Write-Host "    console.log('getImageUrl not available yet');" -ForegroundColor White
Write-Host "  }" -ForegroundColor White
Write-Host "}, 2000);" -ForegroundColor White
Write-Host ""

Write-Host "✅ Expected Results:" -ForegroundColor Green
Write-Host "- No 'process is not defined' errors" -ForegroundColor Gray
Write-Host "- No 'Cannot read properties of undefined' errors" -ForegroundColor Gray
Write-Host "- Application loads without white screen" -ForegroundColor Gray
Write-Host "- Images load with proper https://api.bhavyabazaar.com/uploads/ URLs" -ForegroundColor Gray
Write-Host "- No malformed URLs like 'api.bhavyabazaar.comfilename.jpg'" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 If all tests pass, the application is ready for production deployment!" -ForegroundColor Green
