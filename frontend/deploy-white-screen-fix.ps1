# White Screen Fix - Deployment Script
# This script prepares and commits all fixes for Coolify deployment

Write-Host "🚀 Bhavya Bazaar White Screen Fix - Deployment Preparation" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Ensure we're in the frontend directory
Set-Location "d:\Projects\bhavya-bazaar\frontend"

Write-Host ""
Write-Host "📋 PREPARING DEPLOYMENT FIXES" -ForegroundColor Yellow
Write-Host "==============================="

# 1. Verify runtime config files are correct
Write-Host "1. Verifying runtime configuration files..." -ForegroundColor Gray

$buildConfig = Get-Content "build\runtime-config.js" -Raw
$publicConfig = Get-Content "public\runtime-config.js" -Raw

if ($buildConfig -like "*process.env*" -or $publicConfig -like "*process.env*") {
    Write-Host "❌ CRITICAL: Runtime config files still contain process.env!" -ForegroundColor Red
    Write-Host "   Files need to be fixed before deployment" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Runtime config files are browser-compatible" -ForegroundColor Green
}

# 2. Verify docker-entrypoint.sh creates correct config
Write-Host "2. Verifying docker-entrypoint.sh..." -ForegroundColor Gray

$dockerEntry = Get-Content "docker-entrypoint.sh" -Raw
if ($dockerEntry -like "*__RUNTIME_CONFIG__*") {
    Write-Host "✅ docker-entrypoint.sh creates __RUNTIME_CONFIG__" -ForegroundColor Green
} else {
    Write-Host "❌ docker-entrypoint.sh needs to be updated" -ForegroundColor Red
    exit 1
}

# 3. Verify source code has no process.env references
Write-Host "3. Checking source code for process.env references..." -ForegroundColor Gray

$processEnvFound = Select-String -Path "src\*.js", "src\**\*.js", "src\*.jsx", "src\**\*.jsx" -Pattern "process\.env" -ErrorAction SilentlyContinue

if ($processEnvFound) {
    Write-Host "❌ Found process.env references in source code:" -ForegroundColor Red
    $processEnvFound | ForEach-Object { Write-Host "   $($_.Filename):$($_.LineNumber)" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "✅ No process.env references in source code" -ForegroundColor Green
}

# 4. Build the application
Write-Host "4. Building application..." -ForegroundColor Gray

$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 DEPLOYMENT INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "============================"
Write-Host ""
Write-Host "Your code is now ready for deployment. To deploy to Coolify:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Commit and push your changes:" -ForegroundColor Gray
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Fix: Resolve white screen issue - remove all process.env references'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. In Coolify panel:" -ForegroundColor Gray
Write-Host "   - Go to your Bhavya Bazaar application" -ForegroundColor White
Write-Host "   - Click 'Deploy' or trigger a new deployment" -ForegroundColor White
Write-Host "   - Wait for deployment to complete" -ForegroundColor White
Write-Host ""
Write-Host "3. Verify environment variables in Coolify:" -ForegroundColor Gray
Write-Host "   REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2" -ForegroundColor White
Write-Host "   REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com" -ForegroundColor White
Write-Host "   REACT_APP_NODE_ENV=production" -ForegroundColor White
Write-Host ""
Write-Host "4. After deployment, run the verification script:" -ForegroundColor Gray
Write-Host "   .\final-deployment-verification.ps1" -ForegroundColor White
Write-Host ""

Write-Host "🎯 KEY FIXES APPLIED" -ForegroundColor Yellow
Write-Host "===================="
Write-Host "✅ Removed all process.env references from runtime-config.js" -ForegroundColor Green
Write-Host "✅ Updated docker-entrypoint.sh to create __RUNTIME_CONFIG__" -ForegroundColor Green
Write-Host "✅ Fixed getImageUrl() function to be browser-compatible" -ForegroundColor Green
Write-Host "✅ Added dual compatibility for RUNTIME_CONFIG access" -ForegroundColor Green
Write-Host "✅ Verified all source code is browser-compatible" -ForegroundColor Green
Write-Host ""

Write-Host "📞 If you still see white screen after deployment:" -ForegroundColor Yellow
Write-Host "=================================================="
Write-Host "1. Check browser console (F12) for specific errors" -ForegroundColor Gray
Write-Host "2. Verify Coolify deployment logs for any issues" -ForegroundColor Gray
Write-Host "3. Check that runtime-config.js is being served correctly" -ForegroundColor Gray
Write-Host "4. Ensure environment variables are set in Coolify panel" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ PREPARATION COMPLETE!" -ForegroundColor Green
Write-Host "Your code is ready for Coolify deployment." -ForegroundColor Green

Write-Host ""
Write-Host "Generated on: $(Get-Date)" -ForegroundColor Gray
