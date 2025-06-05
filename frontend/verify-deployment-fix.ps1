#!/usr/bin/env pwsh
# Comprehensive deployment verification script
# Tests if the white screen fix has been successfully deployed

Write-Host "=== Bhavya Bazaar Deployment Verification ==="
Write-Host "Testing deployment after Docker entrypoint fix..."
Write-Host ""

$urls = @{
    "Main Site" = "https://bhavyabazaar.com/"
    "Runtime Config" = "https://bhavyabazaar.com/runtime-config.js"
    "Static Assets" = "https://bhavyabazaar.com/static/js/main.651dd521.js"
}

$results = @{}

foreach ($name in $urls.Keys) {
    $url = $urls[$name]
    Write-Host "Testing $name ($url)..."
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 15 -ErrorAction Stop
        $status = $response.StatusCode
        $contentLength = $response.Content.Length
        
        Write-Host "  ✅ Status: $status, Size: $contentLength bytes"
        
        if ($name -eq "Runtime Config") {
            $content = $response.Content
            if ($content -match "process\.env") {
                Write-Host "  ❌ CRITICAL: Still contains process.env references!"
                $results[$name] = "FAILED - Has process.env"
                
                # Show the problematic lines
                $lines = $content -split "`n"
                $processEnvLines = $lines | Select-String "process\.env" | Select-Object -First 3
                foreach ($line in $processEnvLines) {
                    Write-Host "    Problem line: $line"
                }
            } elseif ($content -match "window\.__RUNTIME_CONFIG__") {
                Write-Host "  ✅ SUCCESS: Proper runtime config format detected!"
                $results[$name] = "SUCCESS"
            } else {
                Write-Host "  ⚠️ Unknown format in runtime config"
                $results[$name] = "UNCERTAIN"
            }
        } elseif ($name -eq "Main Site") {
            $content = $response.Content
            if ($content -match "<title[^>]*>([^<]+)</title>") {
                $title = $matches[1]
                Write-Host "  📄 Page title: $title"
            }
            
            if ($content -match "Bhavya|Bazaar|Shop|Welcome") {
                Write-Host "  ✅ Site content appears to be loading correctly"
                $results[$name] = "SUCCESS"
            } else {
                Write-Host "  ❌ Possible white screen - no expected content found"
                $results[$name] = "POSSIBLE_WHITE_SCREEN"
            }
        } else {
            $results[$name] = "SUCCESS"
        }
        
    } catch {
        Write-Host "  ❌ ERROR: $($_.Exception.Message)"
        $results[$name] = "ERROR"
    }
    
    Write-Host ""
}

Write-Host "=== SUMMARY ==="
$allSuccess = $true
foreach ($name in $results.Keys) {
    $result = $results[$name]
    $icon = if ($result -eq "SUCCESS") { "✅" } elseif ($result.StartsWith("ERROR")) { "❌" } else { "⚠️" }
    Write-Host "$icon $name`: $result"
    
    if ($result -ne "SUCCESS") {
        $allSuccess = $false
    }
}

Write-Host ""
if ($allSuccess) {
    Write-Host "🎉 ALL TESTS PASSED! Deployment appears successful."
    Write-Host "The white screen issue should be resolved."
} else {
    Write-Host "⚠️ SOME ISSUES DETECTED. The deployment may need more time or additional fixes."
    Write-Host ""
    Write-Host "If runtime-config.js still has process.env:"
    Write-Host "1. Wait 5-10 more minutes for Coolify to complete deployment"
    Write-Host "2. Check Coolify build logs for any errors"
    Write-Host "3. Verify the correct Dockerfile is being used"
    Write-Host "4. Consider forcing a complete rebuild in Coolify"
}

Write-Host ""
Write-Host "Current time: $(Get-Date)"
Write-Host "=== END VERIFICATION ==="
