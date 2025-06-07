# Bhavya Bazaar Deployment Status Check
Write-Host "🔍 BHAVYA BAZAAR DEPLOYMENT STATUS" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

$endpoints = @(
    @{name="Frontend Root"; url="https://bhavyabazaar.com"},
    @{name="Backend Root"; url="https://api.bhavyabazaar.com"},
    @{name="Backend Health"; url="https://api.bhavyabazaar.com/api/v2/health"},
    @{name="Debug Endpoint"; url="https://api.bhavyabazaar.com/api/v2/debug/env"},
    @{name="User Login"; url="https://api.bhavyabazaar.com/api/v2/user/login-user"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n📡 Testing: $($endpoint.name)" -ForegroundColor Cyan
    Write-Host "URL: $($endpoint.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "📄 Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
        
        if ($response.Content.Length -gt 0) {
            $preview = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
            Write-Host "📝 Preview: $preview..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

Write-Host "`n💡 RECOMMENDATIONS:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "1. Check Coolify service logs for startup errors"
Write-Host "2. Verify environment variables are set in Coolify"
Write-Host "3. Ensure both frontend and backend services show 'Running' status"
Write-Host "4. Check if deployment completed successfully"
Write-Host "5. Look for MongoDB or Redis connection errors in logs"
