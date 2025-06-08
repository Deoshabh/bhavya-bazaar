# Test Frontend as Node.js App - PowerShell Script

Write-Host "🚀 Testing Frontend as Node.js Application" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the application
Write-Host "📦 Step 1: Building React Application..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Start the Node.js server
Write-Host "🌐 Step 2: Starting Node.js SPA Server..." -ForegroundColor Yellow
Write-Host "This will start the server on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Expected Benefits:" -ForegroundColor Green
Write-Host "• ✅ All routes will return 200 OK (no more 404s)" -ForegroundColor Green
Write-Host "• ✅ Page refresh will work perfectly" -ForegroundColor Green
Write-Host "• ✅ Direct links and bookmarks will work" -ForegroundColor Green
Write-Host "• ✅ No nginx configuration needed" -ForegroundColor Green
Write-Host "• ✅ Same behavior in development and production" -ForegroundColor Green

Write-Host ""
Write-Host "🧪 Test these routes after starting:" -ForegroundColor Cyan
Write-Host "• http://localhost:3000/" -ForegroundColor White
Write-Host "• http://localhost:3000/login" -ForegroundColor White
Write-Host "• http://localhost:3000/profile" -ForegroundColor White
Write-Host "• http://localhost:3000/shop" -ForegroundColor White
Write-Host "• http://localhost:3000/health (health check)" -ForegroundColor White

Write-Host ""
Write-Host "🔄 Starting server in 3 seconds..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

# Start the Node.js server
npm run serve:spa
