# PowerShell script to test authentication endpoints
Write-Host "🔍 Testing Authentication Workflow..." -ForegroundColor Blue
Write-Host ""

$API_BASE = "https://api.bhavyabazaar.com/api/v2"

# Test 1: Check /user/getuser (should return 401 for unauthenticated users)
Write-Host "1. Testing /user/getuser (should return 401 for unauthenticated)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/user/getuser" -Method GET -SessionVariable session
    Write-Host "❌ Unexpected success - user should not be authenticated" -ForegroundColor Red
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Expected 401 - user not authenticated" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Check /shop/getSeller (should return 401 for unauthenticated sellers)
Write-Host ""
Write-Host "2. Testing /shop/getSeller (should return 401 for unauthenticated)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/shop/getSeller" -Method GET -WebSession $session
    Write-Host "❌ Unexpected success - seller should not be authenticated" -ForegroundColor Red
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Expected 401 - seller not authenticated" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Check public endpoints
Write-Host ""
Write-Host "3. Testing public endpoints..." -ForegroundColor Yellow

try {
    $products = Invoke-RestMethod -Uri "$API_BASE/product/get-all-products" -Method GET
    Write-Host "✅ Products endpoint working: $($products.products.Count) products" -ForegroundColor Green
} catch {
    Write-Host "❌ Products endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $events = Invoke-RestMethod -Uri "$API_BASE/event/get-all-events" -Method GET
    Write-Host "✅ Events endpoint working: $($events.events.Count) events" -ForegroundColor Green
} catch {
    Write-Host "❌ Events endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test login endpoints
Write-Host ""
Write-Host "4. Testing login endpoints availability..." -ForegroundColor Yellow

try {
    $loginData = @{
        phoneNumber = "test"
        password = "test"
    }
    $response = Invoke-RestMethod -Uri "$API_BASE/user/login-user" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    Write-Host "❌ Login should fail with invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ User login endpoint is working (returns 400 for invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "❌ User login endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

try {
    $shopLoginData = @{
        phoneNumber = "test"
        password = "test"
    }
    $response = Invoke-RestMethod -Uri "$API_BASE/shop/login-shop" -Method POST -Body ($shopLoginData | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    Write-Host "❌ Shop login should fail with invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Shop login endpoint is working (returns 400 for invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "❌ Shop login endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Authentication test completed!" -ForegroundColor Blue
