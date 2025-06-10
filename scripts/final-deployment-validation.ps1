# Bhavya Bazaar - Final Deployment Validation Script
# This script validates the complete deployment

Write-Host "🚀 Bhavya Bazaar - Final Deployment Validation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuration
$frontendUrl = "https://bhavyabazaar.com"
$apiUrl = "https://api.bhavyabazaar.com"

Write-Host "`n🔍 Testing Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method HEAD -TimeoutSec 10
    Write-Host "✅ Frontend accessible: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Testing API Endpoint..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "$apiUrl/api/v2/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API accessible: $($apiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Testing Runtime Configuration..." -ForegroundColor Yellow
$runtimeConfigPath = "e:\Projects\bhavya-bazaar\frontend\build\runtime-config.js"
if (Test-Path $runtimeConfigPath) {
    Write-Host "✅ Runtime config file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Runtime config file not found" -ForegroundColor Red
}

Write-Host "`n✅ Validation Complete!" -ForegroundColor Green