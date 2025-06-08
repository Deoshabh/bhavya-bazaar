#!/usr/bin/env pwsh
# Quick test for Node.js frontend server on port 3004

Write-Host "🧪 Testing Node.js Frontend Server (Port 3004)" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# Check if we're in the frontend directory
if (!(Test-Path "production-server.js")) {
    Write-Host "📂 Navigating to frontend directory..." -ForegroundColor Blue
    if (Test-Path "../frontend/production-server.js") {
        Set-Location ../frontend
    } elseif (Test-Path "frontend/production-server.js") {
        Set-Location frontend
    } else {
        Write-Host "❌ Error: Cannot find production-server.js" -ForegroundColor Red
        Write-Host "   Run this script from project root or frontend directory" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Blue

# Check if build exists
if (!(Test-Path "build")) {
    Write-Host "📦 Build directory not found. Building React app..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🚀 Starting Node.js server on port 3004..." -ForegroundColor Green

# Start server and capture process
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node production-server.js
}

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep 3

# Test endpoints
Write-Host "`n🔍 Testing endpoints..." -ForegroundColor Blue

# Test 1: Health check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3004/health" -TimeoutSec 5
    Write-Host "✅ Health check: $($health.status)" -ForegroundColor Green
    Write-Host "   Service: $($health.service)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Root route
try {
    $root = Invoke-WebRequest -Uri "http://localhost:3004/" -TimeoutSec 5
    if ($root.StatusCode -eq 200) {
        Write-Host "✅ Root route (/) works" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Root route failed: $_" -ForegroundColor Red
}

# Test 3: SPA routes (these should NOT return 404)
$testRoutes = @("/login", "/profile", "/dashboard", "/products", "/cart")

Write-Host "`n🎯 Testing SPA routes (the fix for your issue):" -ForegroundColor Blue
foreach ($route in $testRoutes) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3004$route" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $route → 200 OK (SPA routing works!)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $route → $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $route → Failed: $_" -ForegroundColor Red
    }
}

# Test 4: Static files
try {
    $static = Invoke-WebRequest -Uri "http://localhost:3004/runtime-config.js" -TimeoutSec 5
    if ($static.StatusCode -eq 200) {
        Write-Host "✅ Static files work (runtime-config.js)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Static files failed: $_" -ForegroundColor Red
}

# Show server logs
Write-Host "`n📋 Server logs:" -ForegroundColor Blue
Write-Host "===============" -ForegroundColor Cyan
Receive-Job $serverJob

# Clean up
Write-Host "`n🛑 Stopping server..." -ForegroundColor Yellow
Stop-Job $serverJob
Remove-Job $serverJob

# Kill any remaining node processes on port 3004
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $connections = netstat -ano | Select-String ":3004"
        if ($connections -match $_.Id) {
            Stop-Process -Id $_.Id -Force
            Write-Host "🛑 Stopped node process: $($_.Id)" -ForegroundColor Blue
        }
    } catch {
        # Ignore errors
    }
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Blue
Write-Host "=========" -ForegroundColor Cyan
Write-Host "✅ If all tests passed, your Node.js server is ready!" -ForegroundColor Green
Write-Host "✅ SPA routing will work (no more 404s on refresh)" -ForegroundColor Green
Write-Host "✅ Users won't get logged out when navigating directly to routes" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next step: Deploy using the deploy-nodejs-frontend-3004.ps1 script" -ForegroundColor Blue
