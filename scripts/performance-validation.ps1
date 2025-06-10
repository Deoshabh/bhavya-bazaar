# Bhavya Bazaar - Performance Validation Script
# This script runs comprehensive performance tests on the production build

Write-Host "🚀 Bhavya Bazaar - Performance Validation" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Configuration
$buildPath = "e:\Projects\bhavya-bazaar\frontend\build"
$testUrl = "http://localhost:3004"

# Function to format file sizes
function Format-FileSize {
    param([int64]$Size)
    if ($Size -lt 1KB) { return "$Size B" }
    elseif ($Size -lt 1MB) { return "{0:N2} KB" -f ($Size / 1KB) }
    elseif ($Size -lt 1GB) { return "{0:N2} MB" -f ($Size / 1MB) }
    else { return "{0:N2} GB" -f ($Size / 1GB) }
}

Write-Host "`n🔍 Build Analysis..." -ForegroundColor Yellow

if (Test-Path $buildPath) {
    Write-Host "✅ Build directory found" -ForegroundColor Green
    
    # Analyze bundle sizes
    $jsFiles = Get-ChildItem "$buildPath\static\js" -Filter "*.js" | Sort-Object Length -Descending
    $cssFiles = Get-ChildItem "$buildPath\static\css" -Filter "*.css" | Sort-Object Length -Descending
    
    Write-Host "`n📊 JavaScript Bundle Analysis:" -ForegroundColor Cyan
    $totalJsSize = 0
    foreach ($file in $jsFiles) {
        $size = Format-FileSize $file.Length
        $totalJsSize += $file.Length
        $status = if ($file.Length -gt 2MB) { "⚠️" } elseif ($file.Length -gt 1MB) { "🔶" } else { "✅" }
        Write-Host "   $status $($file.Name): $size"
    }
    Write-Host "   📦 Total JS: $(Format-FileSize $totalJsSize)" -ForegroundColor Blue
    
    Write-Host "`n🎨 CSS Bundle Analysis:" -ForegroundColor Cyan
    $totalCssSize = 0
    foreach ($file in $cssFiles) {
        $size = Format-FileSize $file.Length
        $totalCssSize += $file.Length
        $status = if ($file.Length -gt 500KB) { "⚠️" } elseif ($file.Length -gt 200KB) { "🔶" } else { "✅" }
        Write-Host "   $status $($file.Name): $size"
    }
    Write-Host "   📦 Total CSS: $(Format-FileSize $totalCssSize)" -ForegroundColor Blue
    
    # Check for source maps
    $sourceMaps = Get-ChildItem $buildPath -Recurse -Filter "*.map"
    if ($sourceMaps.Count -eq 0) {
        Write-Host "✅ No source maps in production build" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Found $($sourceMaps.Count) source maps in production" -ForegroundColor Yellow
    }
    
    # Check compression
    $gzipFiles = Get-ChildItem $buildPath -Recurse -Filter "*.gz"
    if ($gzipFiles.Count -gt 0) {
        Write-Host "✅ Found $($gzipFiles.Count) pre-compressed files" -ForegroundColor Green
    } else {
        Write-Host "💡 Consider enabling gzip pre-compression" -ForegroundColor Blue
    }
    
} else {
    Write-Host "❌ Build directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting Performance Test Server..." -ForegroundColor Yellow

# Start the production server for testing
$serverScript = "e:\Projects\bhavya-bazaar\frontend\production-server.js"
if (Test-Path $serverScript) {
    Write-Host "🔄 Starting server on port 3004..." -ForegroundColor Blue
    
    $serverJob = Start-Job -ScriptBlock {
        param($scriptPath)
        Set-Location (Split-Path $scriptPath)
        node $scriptPath
    } -ArgumentList $serverScript
    
    # Wait for server to start
    Start-Sleep -Seconds 3
    
    # Test if server is responding
    try {
        $response = Invoke-WebRequest -Uri "$testUrl/health" -Method GET -TimeoutSec 5
        Write-Host "✅ Server started successfully: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
        Stop-Job $serverJob -Force
        Remove-Job $serverJob
        exit 1
    }
    
    Write-Host "`n🔍 Performance Tests..." -ForegroundColor Yellow
    
    # Test 1: Page Load Time
    Write-Host "📊 Testing page load times..." -ForegroundColor Blue
    $pages = @("/", "/products", "/about", "/contact")
    
    foreach ($page in $pages) {
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri "$testUrl$page" -Method GET -TimeoutSec 10
            $endTime = Get-Date
            $loadTime = ($endTime - $startTime).TotalMilliseconds
            
            $status = if ($loadTime -lt 1000) { "✅" } elseif ($loadTime -lt 2000) { "🔶" } else { "⚠️" }
            Write-Host "   $status $page`: $($loadTime.ToString("F0"))ms" -ForegroundColor $(if ($loadTime -lt 1000) { "Green" } elseif ($loadTime -lt 2000) { "Yellow" } else { "Red" })
        } catch {
            Write-Host "   ❌ $page`: Failed to load" -ForegroundColor Red
        }
    }
    
    # Test 2: Static Asset Loading
    Write-Host "`n📦 Testing static asset loading..." -ForegroundColor Blue
    
    $staticAssets = @(
        "/static/js/main.*",
        "/static/css/main.*",
        "/favicon.ico",
        "/logo192.png"
    )
    
    foreach ($asset in $staticAssets) {
        try {
            $startTime = Get-Date
            $response = Invoke-WebRequest -Uri "$testUrl$asset" -Method HEAD -TimeoutSec 5 2>$null
            $endTime = Get-Date
            $loadTime = ($endTime - $startTime).TotalMilliseconds
            
            $cacheControl = $response.Headers["Cache-Control"]
            $hasCache = $cacheControl -and $cacheControl -match "max-age"
            
            $status = if ($loadTime -lt 500 -and $hasCache) { "✅" } elseif ($loadTime -lt 1000) { "🔶" } else { "⚠️" }
            $cacheStatus = if ($hasCache) { "📋 Cached" } else { "❌ No Cache" }
            
            Write-Host "   $status $asset`: $($loadTime.ToString("F0"))ms - $cacheStatus"
        } catch {
            # Skip 404s for wildcard patterns
            if ($asset -match "\*") {
                Write-Host "   💡 $asset`: Pattern not testable directly" -ForegroundColor Blue
            } else {
                Write-Host "   ❌ $asset`: Not found" -ForegroundColor Red
            }
        }
    }
    
    # Test 3: Compression Test
    Write-Host "`n🗜️ Testing compression..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Headers @{"Accept-Encoding" = "gzip, deflate"} -TimeoutSec 5
        $encoding = $response.Headers["Content-Encoding"]
        
        if ($encoding -match "gzip") {
            Write-Host "   ✅ Gzip compression enabled" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Gzip compression not detected" -ForegroundColor Yellow
        }
        
        $contentLength = $response.RawContentLength
        Write-Host "   📏 Response size: $(Format-FileSize $contentLength)" -ForegroundColor Blue
        
    } catch {
        Write-Host "   ❌ Failed to test compression" -ForegroundColor Red
    }
    
    # Test 4: Security Headers
    Write-Host "`n🔒 Testing security headers..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method HEAD -TimeoutSec 5
        $headers = $response.Headers
        
        $securityChecks = @{
            "X-Frame-Options" = "Frame protection"
            "X-Content-Type-Options" = "Content type protection"
            "X-XSS-Protection" = "XSS protection"
        }
        
        foreach ($header in $securityChecks.Keys) {
            if ($headers.ContainsKey($header)) {
                Write-Host "   ✅ $($securityChecks[$header]): $($headers[$header])" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ Missing: $($securityChecks[$header])" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "   ❌ Failed to test security headers" -ForegroundColor Red
    }
    
    # Clean up
    Write-Host "`n🛑 Stopping test server..." -ForegroundColor Blue
    Stop-Job $serverJob -Force
    Remove-Job $serverJob
    
} else {
    Write-Host "❌ Production server script not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Performance Summary" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Performance recommendations
Write-Host "`n💡 Performance Recommendations:" -ForegroundColor Magenta

$totalSize = $totalJsSize + $totalCssSize
if ($totalSize -gt 5MB) {
    Write-Host "⚠️ Consider code splitting - total bundle size is $(Format-FileSize $totalSize)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Bundle size is optimized" -ForegroundColor Green
}

if ($jsFiles.Count -gt 10) {
    Write-Host "⚠️ Consider reducing number of JS chunks" -ForegroundColor Yellow
} else {
    Write-Host "✅ JS chunk count is reasonable" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Run Lighthouse audit for detailed performance metrics"
Write-Host "2. Test on slower network conditions"
Write-Host "3. Monitor real user metrics in production"
Write-Host "4. Set up performance budgets for CI/CD"

Write-Host "`n✅ Performance validation complete!" -ForegroundColor Green
