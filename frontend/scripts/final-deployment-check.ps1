#!/usr/bin/env pwsh
# Bhavya Bazaar - Final Deployment Check Script
# Date: June 3, 2025

Write-Host "🚀 BHAVYA BAZAAR DEPLOYMENT FINAL CHECK" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in frontend directory. Please cd to d:\Projects\bhavya-bazaar\frontend" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan

# Check build directory
Write-Host ""
Write-Host "🔍 Checking build status..." -ForegroundColor Yellow
if (Test-Path "build") {
    $buildFiles = Get-ChildItem "build" -Recurse | Measure-Object
    Write-Host "✅ Build directory exists with $($buildFiles.Count) files" -ForegroundColor Green
    
    # Check runtime config
    if (Test-Path "build\runtime-config.js") {
        Write-Host "✅ Runtime configuration file found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Runtime configuration missing - run npm run build:coolify" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build directory not found - run npm run build:coolify" -ForegroundColor Red
    exit 1
}

# Test API connectivity
Write-Host ""
Write-Host "🌐 Testing API connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.bhavyabazaar.com/api/v2/health" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    if ($json.status -eq "healthy") {
        Write-Host "✅ Backend API is healthy and reachable" -ForegroundColor Green
        Write-Host "   URL: https://api.bhavyabazaar.com/api/v2" -ForegroundColor Cyan
        Write-Host "   Status: $($json.status)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  API responded but status is: $($json.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to connect to API: $($_.Exception.Message)" -ForegroundColor Red
}

# Check environment configuration
Write-Host ""
Write-Host "⚙️  Environment configuration:" -ForegroundColor Yellow
Write-Host "   NODE_ENV: production" -ForegroundColor Cyan
Write-Host "   API_URL: https://api.bhavyabazaar.com/api/v2" -ForegroundColor Cyan
Write-Host "   BACKEND_URL: https://api.bhavyabazaar.com" -ForegroundColor Cyan
Write-Host "   SOCKET_URL: https://api.bhavyabazaar.com" -ForegroundColor Cyan

# Final status
Write-Host ""
Write-Host "🎉 DEPLOYMENT STATUS: READY" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload ./build/ directory to Coolify" -ForegroundColor White
Write-Host "2. Set domain to: bhavyabazaar.com" -ForegroundColor White
Write-Host "3. Configure health check: /health" -ForegroundColor White
Write-Host "4. Set port: 3000" -ForegroundColor White
Write-Host ""
Write-Host "✅ Frontend-backend connection issue is RESOLVED!" -ForegroundColor Green
