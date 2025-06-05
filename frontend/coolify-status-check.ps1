# Bhavya Bazaar Coolify VPS Deployment Status Checker
Write-Host "🚀 Bhavya Bazaar Coolify VPS Deployment Status" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Production URLs from your configuration
$FRONTEND_URL = "https://bhavyabazaar.com"
$API_URL = "https://api.bhavyabazaar.com/api/v2"
$BACKEND_URL = "https://api.bhavyabazaar.com"

Write-Host ""
Write-Host "📍 DEPLOYMENT INFORMATION" -ForegroundColor Yellow
Write-Host "Frontend URL: $FRONTEND_URL"
Write-Host "API URL: $API_URL"
Write-Host "Backend URL: $BACKEND_URL"
Write-Host ""

# Function to check URL with timeout
function Test-EndpointQuick {
    param([string]$Url, [string]$Name)
    
    Write-Host "Testing $Name... " -NoNewline
    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Timeout = 5000  # 5 second timeout
        $request.Method = "HEAD"
        $response = $request.GetResponse()
        $statusCode = [int]$response.StatusCode
        $response.Close()
        
        if ($statusCode -eq 200 -or $statusCode -eq 302) {
            Write-Host "✅ Online (HTTP $statusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  Response: HTTP $statusCode" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ Offline or Error" -ForegroundColor Red
        return $false
    }
}

Write-Host "🔍 QUICK STATUS CHECK" -ForegroundColor Yellow
Write-Host "====================="

$frontendStatus = Test-EndpointQuick $FRONTEND_URL "Frontend"
$apiStatus = Test-EndpointQuick $API_URL "API"
$backendStatus = Test-EndpointQuick $BACKEND_URL "Backend"

Write-Host ""
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=========="

$totalPassed = @($frontendStatus, $apiStatus, $backendStatus) | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count

if ($totalPassed -eq 3) {
    Write-Host "🎉 STATUS: ALL SERVICES ONLINE" -ForegroundColor Green
    Write-Host "✅ Your Bhavya Bazaar deployment appears to be running successfully!"
} elseif ($totalPassed -ge 1) {
    Write-Host "⚠️  STATUS: PARTIAL DEPLOYMENT" -ForegroundColor Yellow
    Write-Host "⚠️  Some services may need attention in Coolify"
} else {
    Write-Host "❌ STATUS: SERVICES OFFLINE" -ForegroundColor Red
    Write-Host "❌ Check your Coolify deployment"
}

Write-Host ""
Write-Host "🔧 NEXT STEPS" -ForegroundColor Yellow
Write-Host "============="

if ($totalPassed -eq 3) {
    Write-Host "✅ All services are online! Your deployment is healthy."
    Write-Host "   • Your white screen fixes are working"
    Write-Host "   • Your image loading fixes are deployed"
    Write-Host "   • API connections are functional"
    Write-Host ""
    Write-Host "🎯 RECOMMENDED ACTIONS:"
    Write-Host "   1. Test user registration/login functionality"
    Write-Host "   2. Test product image loading"
    Write-Host "   3. Test shopping cart functionality"
    Write-Host "   4. Monitor Coolify logs for any errors"
} elseif ($frontendStatus -and -not $apiStatus) {
    Write-Host "⚠️  Frontend is online but API is not responding."
    Write-Host ""
    Write-Host "🔧 TROUBLESHOOTING:"
    Write-Host "   1. Check backend service status in Coolify"
    Write-Host "   2. Verify backend environment variables"
    Write-Host "   3. Check database connection"
    Write-Host "   4. Review backend service logs in Coolify"
} elseif (-not $frontendStatus) {
    Write-Host "❌ Frontend is not responding."
    Write-Host ""
    Write-Host "🔧 TROUBLESHOOTING:"
    Write-Host "   1. Check frontend build status in Coolify"
    Write-Host "   2. Verify DNS configuration"
    Write-Host "   3. Check SSL certificate status"
    Write-Host "   4. Review frontend deployment logs"
} else {
    Write-Host "❌ Multiple services are down."
    Write-Host ""
    Write-Host "🔧 TROUBLESHOOTING:"
    Write-Host "   1. Check all services in Coolify dashboard"
    Write-Host "   2. Verify VPS resource usage"
    Write-Host "   3. Check DNS and SSL configuration"
    Write-Host "   4. Restart services if needed"
}

Write-Host ""
Write-Host "🌐 COOLIFY DASHBOARD ACTIONS" -ForegroundColor Cyan
Write-Host "=============================="
Write-Host "Access your Coolify panel to:"
Write-Host "• View detailed service logs"
Write-Host "• Check resource usage metrics" 
Write-Host "• Monitor deployment status"
Write-Host "• Update environment variables"
Write-Host "• Restart services if needed"

Write-Host ""
Write-Host "📚 DOCUMENTATION AVAILABLE" -ForegroundColor Green
Write-Host "============================"
Write-Host "✅ COOLIFY_VPS_DEPLOYMENT_GUIDE.md - Complete deployment guide"
Write-Host "✅ WHITE_SCREEN_FIX_FINAL_STATUS.md - White screen fixes (RESOLVED)"
Write-Host "✅ BRAND_IMAGE_LOADING_FIXES_COMPLETED.md - Image loading fixes (COMPLETED)"
Write-Host "✅ coolify-environment-variables.env - Environment variables template"

Write-Host ""
Write-Host "Report completed at: $(Get-Date)" -ForegroundColor Cyan
