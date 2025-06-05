# Coolify Deployment Verification Script (PowerShell)
# This script helps verify your Bhavya Bazaar deployment on Coolify

Write-Host "🚀 Bhavya Bazaar - Coolify Deployment Verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Configuration
$FRONTEND_URL = $env:FRONTEND_URL -or "https://bhavyabazaar.com"
$API_URL = $env:API_URL -or "https://api.bhavyabazaar.com/api/v2"
$BACKEND_URL = $env:BACKEND_URL -or "https://api.bhavyabazaar.com"

Write-Host "Testing URLs:"
Write-Host "Frontend: $FRONTEND_URL"
Write-Host "API: $API_URL"
Write-Host "Backend: $BACKEND_URL"
Write-Host ""

# Function to test URL
function Test-Url {
    param(
        [string]$Url,
        [string]$Name,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus -or $response.StatusCode -eq 302) {
            Write-Host "✅ SUCCESS" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ FAILED (HTTP $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ FAILED ($($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

Write-Host "🔍 HEALTH CHECKS" -ForegroundColor Yellow
Write-Host "=================="

# Frontend health check
$frontendHealth = Test-Url "$FRONTEND_URL/health" "Frontend Health"

# Frontend main page
$frontendMain = Test-Url "$FRONTEND_URL/" "Frontend Main Page"

# API health check
$apiHealth = Test-Url "$API_URL/health" "API Health"

# Backend health check
$backendHealth = Test-Url "$BACKEND_URL/health" "Backend Health"

Write-Host ""
Write-Host "🖼️  IMAGE LOADING TESTS" -ForegroundColor Yellow
Write-Host "======================="

# Test static brand logos
$brandLogos = @("apple-logo.png", "dell-logo.png", "lg-logo.png", "microsoft-logo.png", "sony-logo.png")
$logoResults = @()

foreach ($logo in $brandLogos) {
    $logoResults += Test-Url "$FRONTEND_URL/brand-logos/$logo" "Brand Logo: $logo"
}

Write-Host ""
Write-Host "⚙️  CONFIGURATION TESTS" -ForegroundColor Yellow
Write-Host "======================="

# Test runtime config
Write-Host "Testing Runtime Configuration... " -NoNewline
try {
    $configResponse = Invoke-WebRequest -Uri "$FRONTEND_URL/runtime-config.js" -TimeoutSec 10 -UseBasicParsing
    $configContent = $configResponse.Content
    
    if ($configContent -match "RUNTIME_CONFIG" -and $configContent -match "API_URL") {
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   API_URL found in runtime config"
        
        # Check for browser compatibility
        if ($configContent -match "https://" -and $configContent -notmatch "process\.env") {
            Write-Host "   ✅ Browser compatible (no process.env references)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  May contain browser-incompatible references" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Runtime config missing or invalid"
    }
}
catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Cannot access runtime config: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🌐 NETWORK CONNECTIVITY" -ForegroundColor Yellow
Write-Host "======================="

# Test API endpoints
$apiEndpoints = @("/health", "/api/v2/products", "/api/v2/shops")
$apiResults = @()

foreach ($endpoint in $apiEndpoints) {
    $apiResults += Test-Url "$BACKEND_URL$endpoint" "API Endpoint: $endpoint"
}

Write-Host ""
Write-Host "📱 FRONTEND FUNCTIONALITY" -ForegroundColor Yellow
Write-Host "========================="

# Test if main page loads content
Write-Host "Testing Frontend Content Loading... " -NoNewline
try {
    $mainPageResponse = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 10 -UseBasicParsing
    $content = $mainPageResponse.Content
    
    if ($content -match "Bhavya" -and $content -match "main\..*\.js") {
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   JavaScript bundle and content detected"
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Content or JavaScript bundle missing"
    }
}
catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Cannot load main page: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🔒 SECURITY CHECKS" -ForegroundColor Yellow
Write-Host "=================="

# Test HTTPS redirect
Write-Host "Testing HTTPS Configuration... " -NoNewline
if ($FRONTEND_URL -match "^https://") {
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Using HTTPS protocol"
} else {
    Write-Host "⚠️  WARNING" -ForegroundColor Yellow
    Write-Host "   Not using HTTPS protocol"
}

# Test security headers
Write-Host "Testing Security Headers... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 10 -UseBasicParsing -Method Head
    $headers = $response.Headers
    
    $securityHeaders = @("X-Frame-Options", "X-Content-Type-Options", "Strict-Transport-Security")
    $foundHeaders = $securityHeaders | Where-Object { $headers.ContainsKey($_) }
    
    if ($foundHeaders.Count -gt 0) {
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Found security headers: $($foundHeaders -join ', ')"
    } else {
        Write-Host "⚠️  WARNING" -ForegroundColor Yellow
        Write-Host "   No security headers detected"
    }
}
catch {
    Write-Host "⚠️  WARNING" -ForegroundColor Yellow
    Write-Host "   Cannot check security headers"
}

Write-Host ""
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=========="

# Count successful tests
$coreTests = @($frontendHealth, $frontendMain, $apiHealth, $backendHealth)
$passedCoreTests = ($coreTests | Where-Object { $_ -eq $true }).Count

Write-Host "Core Tests Passed: $passedCoreTests/4"

if ($passedCoreTests -eq 4) {
    Write-Host "🎉 DEPLOYMENT STATUS: HEALTHY" -ForegroundColor Green
    Write-Host "✅ Your Bhavya Bazaar application appears to be running correctly!"
} elseif ($passedCoreTests -ge 2) {
    Write-Host "⚠️  DEPLOYMENT STATUS: PARTIAL" -ForegroundColor Yellow
    Write-Host "⚠️  Some services may need attention"
} else {
    Write-Host "❌ DEPLOYMENT STATUS: ISSUES DETECTED" -ForegroundColor Red
    Write-Host "❌ Multiple services appear to be down"
}

Write-Host ""
Write-Host "🔧 TROUBLESHOOTING TIPS" -ForegroundColor Yellow
Write-Host "======================="
Write-Host "If tests failed:"
Write-Host "1. Check Coolify logs for error messages"
Write-Host "2. Verify environment variables are set correctly in Coolify"
Write-Host "3. Ensure DNS records point to your VPS IP address"
Write-Host "4. Check SSL certificate status in Coolify dashboard"
Write-Host "5. Verify backend services are running and accessible"
Write-Host "6. Test from different networks to rule out local issues"

Write-Host ""
Write-Host "For detailed logs and management, visit your Coolify dashboard."
Write-Host "Report completed at: $(Get-Date)" -ForegroundColor Cyan

# Optional: Create summary file
$summaryPath = "coolify-deployment-test-results.txt"
$summaryContent = @"
Bhavya Bazaar Coolify Deployment Test Results
=============================================
Date: $(Get-Date)
Frontend URL: $FRONTEND_URL
API URL: $API_URL
Backend URL: $BACKEND_URL

Core Tests Results:
- Frontend Health: $(if($frontendHealth){'PASS'}else{'FAIL'})
- Frontend Main Page: $(if($frontendMain){'PASS'}else{'FAIL'})
- API Health: $(if($apiHealth){'PASS'}else{'FAIL'})
- Backend Health: $(if($backendHealth){'PASS'}else{'FAIL'})

Overall Status: $(if($passedCoreTests -eq 4){'HEALTHY'}elseif($passedCoreTests -ge 2){'PARTIAL'}else{'ISSUES DETECTED'})
"@

$summaryContent | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host "Summary saved to: $summaryPath" -ForegroundColor Green
