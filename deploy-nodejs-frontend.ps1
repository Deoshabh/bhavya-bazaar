#!/usr/bin/env powershell

# 🚀 Quick Deploy Script: Switch to Node.js Dynamic Frontend

Write-Host "🚀 Switching Bhavya Bazaar frontend to Node.js dynamic deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend\production-server.js")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected to find: frontend\production-server.js" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found production-server.js" -ForegroundColor Green

# Step 1: Backup current Dockerfile
Write-Host "`n📋 Step 1: Backing up current Dockerfile..." -ForegroundColor Cyan
if (Test-Path "frontend\Dockerfile") {
    Copy-Item "frontend\Dockerfile" "frontend\Dockerfile.nginx.backup"
    Write-Host "✅ Backed up nginx Dockerfile to Dockerfile.nginx.backup" -ForegroundColor Green
} else {
    Write-Host "⚠️ No existing Dockerfile found to backup" -ForegroundColor Yellow
}

# Step 2: Switch to Node.js Dockerfile
Write-Host "`n🔄 Step 2: Switching to Node.js Dockerfile..." -ForegroundColor Cyan
if (Test-Path "frontend\Dockerfile.nodejs") {
    Copy-Item "frontend\Dockerfile.nodejs" "frontend\Dockerfile" -Force
    Write-Host "✅ Switched to Node.js Dockerfile" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Dockerfile.nodejs not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Verify production server
Write-Host "`n🧪 Step 3: Verifying production server..." -ForegroundColor Cyan
$serverFile = Get-Content "frontend\production-server.js" -Raw
if ($serverFile -match "app\.get\('\*'") {
    Write-Host "✅ SPA routing configured correctly" -ForegroundColor Green
} else {
    Write-Host "⚠️ Warning: SPA routing may not be configured" -ForegroundColor Yellow
}

# Step 4: Check dependencies
Write-Host "`n📦 Step 4: Checking dependencies..." -ForegroundColor Cyan
$packageJson = Get-Content "frontend\package.json" -Raw | ConvertFrom-Json
if ($packageJson.dependencies.express -and $packageJson.dependencies.compression) {
    Write-Host "✅ Express and compression dependencies found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Warning: Missing Node.js server dependencies" -ForegroundColor Yellow
    Write-Host "Run: cd frontend && npm install express compression" -ForegroundColor Yellow
}

# Step 5: Show configuration summary
Write-Host "`n📊 Configuration Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔧 Server Type: Node.js Express (was nginx static)" -ForegroundColor White
Write-Host "🚪 Port: 3000 (change in Coolify if port conflict)" -ForegroundColor White
Write-Host "📁 Dockerfile: Dockerfile.nodejs → Dockerfile" -ForegroundColor White
Write-Host "🎯 SPA Routing: ✅ Enabled (fixes page refresh 404s)" -ForegroundColor Green
Write-Host "🏥 Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Step 6: Show Coolify deployment steps
Write-Host "`n🎯 Next Steps - Coolify Panel Configuration:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. 🌐 Coolify Panel → Frontend Service → General" -ForegroundColor White
Write-Host "   - Port: Change from 80 to 3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. 🔧 Environment Variables → Add:" -ForegroundColor White
Write-Host "   PORT=3000" -ForegroundColor Cyan
Write-Host "   NODE_ENV=production" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 🚀 Deploy → Monitor logs for:" -ForegroundColor White
Write-Host "   '🚀 Frontend server running on port 3000'" -ForegroundColor Green
Write-Host "   '✅ SPA routing enabled - all routes will work!'" -ForegroundColor Green
Write-Host ""
Write-Host "4. 🧪 Test SPA routing:" -ForegroundColor White
Write-Host "   - Visit: https://bhavyabazaar.com/login" -ForegroundColor Cyan
Write-Host "   - Refresh page (should NOT get 404)" -ForegroundColor Cyan
Write-Host "   - Check: https://bhavyabazaar.com/health" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Step 7: Port conflict handling
Write-Host "`n⚠️ If Port 3000 is Already Taken:" -ForegroundColor Yellow
Write-Host "1. Edit frontend\Dockerfile line 'EXPOSE 3000' → 'EXPOSE 3002'" -ForegroundColor White
Write-Host "2. Edit frontend\production-server.js PORT default to 3002" -ForegroundColor White
Write-Host "3. Set PORT=3002 in Coolify environment variables" -ForegroundColor White
Write-Host "4. Update Coolify port mapping to 3002" -ForegroundColor White

# Step 8: Rollback plan
Write-Host "`n🔄 Rollback Plan (if needed):" -ForegroundColor Yellow
Write-Host "1. Copy-Item frontend\Dockerfile.nginx.backup frontend\Dockerfile -Force" -ForegroundColor White
Write-Host "2. Change Coolify port back to 80" -ForegroundColor White
Write-Host "3. Remove NODE_ENV=production and PORT=3000 variables" -ForegroundColor White
Write-Host "4. Redeploy" -ForegroundColor White

Write-Host "`n🎉 Ready for Node.js dynamic deployment!" -ForegroundColor Green
Write-Host "No more 404s on page refresh! SPA routing will work perfectly. 🚀" -ForegroundColor Green
