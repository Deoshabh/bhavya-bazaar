# Bhavya Bazaar - Production Deployment Script (PowerShell)
# This script helps deploy the production build on Windows

Write-Host "🚀 Bhavya Bazaar Production Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if build directory exists
if (-not (Test-Path "frontend\build")) {
    Write-Host "❌ Build directory not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' in the frontend directory first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Production build found" -ForegroundColor Green

# Display build information
Write-Host ""
Write-Host "📦 Build Information:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan

$buildDate = (Get-Item "frontend\build").LastWriteTime
Write-Host "Build created: $buildDate"

$mainBundle = Get-ChildItem "frontend\build\static\js\main.*.js" | Select-Object -First 1
if ($mainBundle) {
    $mainSize = [math]::Round($mainBundle.Length / 1KB, 2)
    Write-Host "Main bundle: $($mainBundle.Name) ($mainSize KB)"
}

$vendorBundle = Get-ChildItem "frontend\build\static\js\vendors.*.js" | Select-Object -First 1
if ($vendorBundle) {
    $vendorSize = [math]::Round($vendorBundle.Length / 1MB, 2)
    Write-Host "Vendor bundle: $($vendorBundle.Name) ($vendorSize MB)"
}

# Display runtime configuration
Write-Host ""
Write-Host "⚙️  Runtime Configuration:" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

if (Test-Path "frontend\build\runtime-config.js") {
    $config = Get-Content "frontend\build\runtime-config.js" | Select-String "API_URL|SOCKET_URL|NODE_ENV"
    $config | ForEach-Object { Write-Host $_.Line.Trim() }
} else {
    Write-Host "Configuration file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Deployment Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload the contents of 'frontend\build\' to your web server"
Write-Host "2. Ensure the web server serves index.html for all routes (SPA routing)"
Write-Host "3. Test the authentication flow thoroughly"
Write-Host "4. Monitor for any console errors"
Write-Host ""
Write-Host "🔗 Key URLs to verify after deployment:" -ForegroundColor Cyan
Write-Host "- Login page: https://bhavyabazaar.com/login"
Write-Host "- API health: https://api.bhavyabazaar.com/health"
Write-Host "- WebSocket: wss://api.bhavyabazaar.com/socket.io"
Write-Host ""
Write-Host "📊 Expected fixes after deployment:" -ForegroundColor Cyan
Write-Host "✅ Authentication login loop resolved" -ForegroundColor Green
Write-Host "✅ Optimized production bundles loaded" -ForegroundColor Green
Write-Host "✅ WebSocket connections working" -ForegroundColor Green
Write-Host "✅ Proper error handling" -ForegroundColor Green

Write-Host ""
Write-Host "💡 To deploy using a typical web server:" -ForegroundColor Yellow
Write-Host "   Copy-Item -Recurse frontend\build\* C:\inetpub\wwwroot\"
Write-Host "   # OR upload via FTP/SCP to your hosting provider"
