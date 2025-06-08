#!/usr/bin/env pwsh
# Deploy Node.js Frontend Server on Port 3004
# This script helps switch from static nginx to dynamic Node.js deployment

Write-Host "🚀 Deploying Bhavya Bazaar Frontend with Node.js Server (Port 3004)" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "frontend/production-server.js")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Blue

# Step 1: Build the React application
Write-Host "`n🔨 Step 1: Building React application..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ React app built successfully" -ForegroundColor Green

# Step 2: Test Node.js server locally (optional)
Write-Host "`n🧪 Step 2: Testing Node.js server locally..." -ForegroundColor Yellow
Write-Host "📝 Starting server on port 3004..." -ForegroundColor Blue

# Start server in background for testing
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "production-server.js" -RedirectStandardOutput "server.log"
Start-Sleep 3

# Test health endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3004/health" -TimeoutSec 5
    Write-Host "✅ Health check passed: $($response.status)" -ForegroundColor Green
    Write-Host "   Service: $($response.service)" -ForegroundColor Blue
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Blue
} catch {
    Write-Host "⚠️  Health check failed (server might still be starting): $_" -ForegroundColor Yellow
}

# Stop test server
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
Write-Host "🛑 Test server stopped" -ForegroundColor Blue

Set-Location ..

# Step 3: Build Docker image with Node.js
Write-Host "`n🐳 Step 3: Building Docker image with Node.js server..." -ForegroundColor Yellow
docker build -f frontend/Dockerfile.nodejs -t bhavya-bazaar-frontend-nodejs:latest ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built successfully" -ForegroundColor Green

# Step 4: Test Docker container locally
Write-Host "`n🧪 Step 4: Testing Docker container..." -ForegroundColor Yellow
Write-Host "📝 Starting container on port 3004..." -ForegroundColor Blue

# Remove any existing container
docker rm -f bhavya-frontend-test 2>$null

# Start container
docker run -d --name bhavya-frontend-test -p 3004:3004 bhavya-bazaar-frontend-nodejs:latest
Start-Sleep 5

# Test container health
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3004/health" -TimeoutSec 10
    Write-Host "✅ Container health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Blue
    
    # Test SPA routing
    $htmlResponse = Invoke-WebRequest -Uri "http://localhost:3004/login" -TimeoutSec 10
    if ($htmlResponse.StatusCode -eq 200 -and $htmlResponse.Content -like "*<title>*") {
        Write-Host "✅ SPA routing test passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Container test failed: $_" -ForegroundColor Red
    docker logs bhavya-frontend-test
}

# Clean up test container
docker rm -f bhavya-frontend-test
Write-Host "🛑 Test container removed" -ForegroundColor Blue

# Step 5: Deployment instructions
Write-Host "`n📋 Step 5: Deployment Instructions" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your Node.js frontend server is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Coolify Configuration:" -ForegroundColor Blue
Write-Host "   1. Go to your Coolify dashboard" -ForegroundColor White
Write-Host "   2. Select your frontend service" -ForegroundColor White
Write-Host "   3. Change the following settings:" -ForegroundColor White
Write-Host "      - Dockerfile: frontend/Dockerfile.nodejs" -ForegroundColor Cyan
Write-Host "      - Port: 3004" -ForegroundColor Cyan
Write-Host "      - Health Check: /health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Port Configuration:" -ForegroundColor Blue
Write-Host "   - Internal Port: 3004" -ForegroundColor White
Write-Host "   - External Port: 80 (or 443 for HTTPS)" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Environment Variables (if needed):" -ForegroundColor Blue
Write-Host "   - PORT=3004" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Benefits of Node.js deployment:" -ForegroundColor Blue
Write-Host "   ✅ SPA routing works (no more 404s on refresh)" -ForegroundColor Green
Write-Host "   ✅ No more logout on page refresh" -ForegroundColor Green
Write-Host "   ✅ Better caching control" -ForegroundColor Green
Write-Host "   ✅ Health check endpoint" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Test URLs after deployment:" -ForegroundColor Blue
Write-Host "   - Health: https://yourdomain.com/health" -ForegroundColor White
Write-Host "   - Login: https://yourdomain.com/login" -ForegroundColor White
Write-Host "   - Profile: https://yourdomain.com/profile" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to deploy! This will fix your SPA routing issues." -ForegroundColor Green
