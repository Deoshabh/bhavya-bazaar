# Bhavya Bazaar - Final Deployment Validation Script
# This script validates the complete deployment including WebSocket connectivity

Write-Host "🚀 Bhavya Bazaar - Final Deployment Validation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuration
$frontendUrl = "https://bhavyabazaar.com"
$apiUrl = "https://api.bhavyabazaar.com"
$soketiHost = "soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io"

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

Write-Host "`n🔍 Testing Soketi WebSocket Host..." -ForegroundColor Yellow
try {
    # Test if the Soketi host is reachable (HTTPS)
    $soketiResponse = Invoke-WebRequest -Uri "https://$soketiHost" -Method HEAD -TimeoutSec 10
    Write-Host "✅ Soketi host accessible: $($soketiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Soketi host not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 This might be normal if Soketi doesn't respond to HTTP HEAD requests" -ForegroundColor Blue
}

Write-Host "`n🔍 Testing Runtime Configuration..." -ForegroundColor Yellow
$runtimeConfigPath = "e:\Projects\bhavya-bazaar\frontend\build\runtime-config.js"
if (Test-Path $runtimeConfigPath) {
    Write-Host "✅ Runtime config file exists" -ForegroundColor Green
    
    # Check if SOKETI config is present
    $configContent = Get-Content $runtimeConfigPath -Raw
    if ($configContent -match "SOKETI.*{") {
        Write-Host "✅ SOKETI configuration found in runtime config" -ForegroundColor Green
    } else {
        Write-Host "❌ SOKETI configuration missing from runtime config" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Runtime config file not found" -ForegroundColor Red
}

Write-Host "`n✅ Validation Complete!" -ForegroundColor Green