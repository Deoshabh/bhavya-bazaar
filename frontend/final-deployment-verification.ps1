# Bhavya Bazaar White Screen Fix - Final Verification Script
# Run this script after deployment to verify all issues are resolved

Write-Host "🚀 Bhavya Bazaar White Screen Fix - Final Verification" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Production URLs
$FRONTEND_URL = "https://bhavyabazaar.com"
$API_URL = "https://api.bhavyabazaar.com"
$RUNTIME_CONFIG_URL = "https://bhavyabazaar.com/runtime-config.js"

Write-Host "📍 Testing Deployment URLs:" -ForegroundColor Yellow
Write-Host "Frontend: $FRONTEND_URL"
Write-Host "API: $API_URL"
Write-Host "Runtime Config: $RUNTIME_CONFIG_URL"
Write-Host ""

# Function to test URL with detailed response
function Test-Url {
    param([string]$Url, [string]$Name, [string]$ExpectedContent = $null)
    
    Write-Host "Testing $Name... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UserAgent "BhavyaBazaar-Verifier/1.0"
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ OK (HTTP 200)" -ForegroundColor Green
            
            if ($ExpectedContent -and $response.Content -notlike "*$ExpectedContent*") {
                Write-Host "   ⚠️  Warning: Expected content '$ExpectedContent' not found" -ForegroundColor Yellow
                return $false
            }
            
            # Show content length
            Write-Host "   📊 Size: $($response.Content.Length) bytes" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "❌ Failed (HTTP $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "🔍 CONNECTIVITY TESTS" -ForegroundColor Yellow
Write-Host "======================"

$frontendOk = Test-Url $FRONTEND_URL "Frontend" "<!doctype html>"
$apiOk = Test-Url $API_URL "Backend API" "Bhavya Bazaar"
$configOk = Test-Url $RUNTIME_CONFIG_URL "Runtime Config" "__RUNTIME_CONFIG__"

Write-Host ""

Write-Host "🔧 RUNTIME CONFIGURATION TEST" -ForegroundColor Yellow
Write-Host "==============================="

try {
    $configResponse = Invoke-WebRequest -Uri $RUNTIME_CONFIG_URL -TimeoutSec 10
    $configContent = $configResponse.Content
    
    # Check for critical issues
    if ($configContent -like "*process.env*") {
        Write-Host "❌ CRITICAL: Runtime config contains process.env references!" -ForegroundColor Red
        Write-Host "   This will cause 'process is not defined' errors in browser" -ForegroundColor Red
    } else {
        Write-Host "✅ No process.env references found" -ForegroundColor Green
    }
    
    if ($configContent -like "*__RUNTIME_CONFIG__*") {
        Write-Host "✅ Uses __RUNTIME_CONFIG__ (correct format)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: May not use __RUNTIME_CONFIG__ format" -ForegroundColor Yellow
    }
    
    if ($configContent -like "*api.bhavyabazaar.com*") {
        Write-Host "✅ Contains production API URL" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Production API URL not found" -ForegroundColor Yellow
    }
    
    # Extract version if available
    if ($configContent -match 'VERSION.*?"([^"]+)"') {
        Write-Host "✅ Version: $($matches[1])" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Failed to analyze runtime config: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

Write-Host "📋 DEPLOYMENT STATUS SUMMARY" -ForegroundColor Yellow
Write-Host "============================="

if ($frontendOk -and $apiOk -and $configOk) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    Write-Host "✅ Backend API is responding" -ForegroundColor Green
    Write-Host "✅ Runtime configuration is loading" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Deployment appears to be successful!" -ForegroundColor Green
    Write-Host "   You can now test the application at: $FRONTEND_URL" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host ""
    if (-not $frontendOk) { Write-Host "❌ Frontend not accessible" -ForegroundColor Red }
    if (-not $apiOk) { Write-Host "❌ Backend API not responding" -ForegroundColor Red }
    if (-not $configOk) { Write-Host "❌ Runtime configuration not loading" -ForegroundColor Red }
    Write-Host ""
    Write-Host "📝 Recommended actions:" -ForegroundColor Yellow
    Write-Host "   1. Check Coolify deployment logs" -ForegroundColor Gray
    Write-Host "   2. Verify environment variables are set correctly" -ForegroundColor Gray
    Write-Host "   3. Ensure docker-entrypoint.sh is generating runtime-config.js properly" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 NEXT STEPS" -ForegroundColor Yellow
Write-Host "=============="
Write-Host "1. Open browser and navigate to: $FRONTEND_URL" -ForegroundColor Gray
Write-Host "2. Check browser console for any errors (F12 -> Console)" -ForegroundColor Gray
Write-Host "3. Test user registration and login functionality" -ForegroundColor Gray
Write-Host "4. Verify product images are loading correctly" -ForegroundColor Gray
Write-Host "5. Test cart and checkout functionality" -ForegroundColor Gray

Write-Host ""
Write-Host "🔍 FOR DEBUGGING" -ForegroundColor Yellow
Write-Host "================"
Write-Host "- Check browser console: F12 -> Console tab" -ForegroundColor Gray
Write-Host "- View runtime config: F12 -> Console -> type 'window.__RUNTIME_CONFIG__'" -ForegroundColor Gray
Write-Host "- Network tab: F12 -> Network tab to see failed requests" -ForegroundColor Gray

Write-Host ""
Write-Host "Generated on: $(Get-Date)" -ForegroundColor Gray
Write-Host "Script: final-deployment-verification.ps1" -ForegroundColor Gray
