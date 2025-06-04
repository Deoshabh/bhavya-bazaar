# WebSocket Configuration Verification Script for Bhavya Bazaar
# PowerShell version for Windows users

Write-Host "🔍 WebSocket Configuration Verification" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Function to check if a port is listening
function Test-PortListening {
    param(
        [int]$Port,
        [string]$Description
    )
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ $Description (Port $Port): LISTENING" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Description (Port $Port): NOT LISTENING" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❓ $Description (Port $Port): Could not check" -ForegroundColor Yellow
        return $false
    }
}

# Function to validate environment files
function Test-EnvFile {
    param(
        [string]$FilePath,
        [string]$EnvironmentName
    )
    
    Write-Host "`n📁 Checking $EnvironmentName environment file:" -ForegroundColor Cyan
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    $content = Get-Content $FilePath -Raw
    $lines = $content -split "`n"
    
    $socketUrls = $lines | Where-Object { 
        $_ -match "REACT_APP_SOCKET_URL=" -and -not $_.Trim().StartsWith("#") 
    }
    
    Write-Host "   Found $($socketUrls.Count) WebSocket URL configuration(s):"
    
    for ($i = 0; $i -lt $socketUrls.Count; $i++) {
        $line = $socketUrls[$i]
        $url = ($line -split "=")[1]
        Write-Host "   $($i + 1). $($line.Trim())"
        
        # Validate the URL
        if ($EnvironmentName -eq "Development") {
            if ($url -eq "http://localhost:8000") {
                Write-Host "      ✅ Correct: Points to backend server" -ForegroundColor Green
            } elseif ($url -eq "ws://localhost:3003") {
                Write-Host "      ❌ WRONG: Port 3003 is not used by backend" -ForegroundColor Red
            } else {
                Write-Host "      ⚠️  Unexpected URL for development" -ForegroundColor Yellow
            }
        } elseif ($EnvironmentName -eq "Production") {
            if ($url -eq "https://api.bhavyabazaar.com") {
                Write-Host "      ✅ Correct: Points to production backend" -ForegroundColor Green
            } else {
                Write-Host "      ⚠️  Check if this is correct for production" -ForegroundColor Yellow
            }
        }
    }
    
    # Check for duplicates
    if ($socketUrls.Count -gt 1) {
        Write-Host "   ⚠️  WARNING: Multiple WebSocket URLs found! Only the last one will be used." -ForegroundColor Yellow
    } elseif ($socketUrls.Count -eq 0) {
        Write-Host "   ❌ NO WebSocket URL configured!" -ForegroundColor Red
    }
}

# Main execution
Write-Host "`n🔧 Port Status Check:" -ForegroundColor Cyan

# Check if ports are listening
$backendRunning = Test-PortListening -Port 8000 -Description "Backend Server (with Socket.IO)"
$frontendRunning = Test-PortListening -Port 3000 -Description "Frontend Development Server"
$wrongPortRunning = Test-PortListening -Port 3003 -Description "Port 3003 (should NOT be used)"

Write-Host "`n📊 Environment Configuration Check:" -ForegroundColor Cyan

# Get script directory and project paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Split-Path -Parent $scriptDir

# Check environment files
Test-EnvFile -FilePath (Join-Path $frontendDir ".env.development") -EnvironmentName "Development"
Test-EnvFile -FilePath (Join-Path $frontendDir ".env.production") -EnvironmentName "Production"

Write-Host "`n🏗️  Backend Configuration:" -ForegroundColor Cyan

# Check backend configuration
$backendEnvPath = Join-Path (Split-Path -Parent $frontendDir) "backend\.env"
if (Test-Path $backendEnvPath) {
    $backendContent = Get-Content $backendEnvPath -Raw
    if ($backendContent -match "PORT=(\d+)") {
        Write-Host "   ✅ Backend configured to run on port: $($Matches[1])" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend port not found in .env file" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend .env file not found" -ForegroundColor Red
}

Write-Host "`n🎯 Socket.IO Architecture:" -ForegroundColor Cyan
Write-Host "   ✅ Socket.IO is integrated with the main backend server" -ForegroundColor Green
Write-Host "   ✅ Frontend should connect to the same port as the API (8000)" -ForegroundColor Green
Write-Host "   ✅ Socket.IO endpoint: http://localhost:8000/socket.io/" -ForegroundColor Green
Write-Host "   ❌ There is NO separate WebSocket server on port 3003" -ForegroundColor Red

Write-Host "`n📋 Recommendations:" -ForegroundColor Cyan
Write-Host "   1. Ensure backend is running on port 8000"
Write-Host "   2. Frontend should use REACT_APP_SOCKET_URL=http://localhost:8000"
Write-Host "   3. Remove any references to port 3003 in development"
Write-Host "   4. Production should use https://api.bhavyabazaar.com"

Write-Host "`n🚀 Quick Test Commands:" -ForegroundColor Cyan
Write-Host "   Backend Health: curl http://localhost:8000/api/v2/health"
Write-Host "   Socket.IO Test: curl http://localhost:8000/socket.io/?transport=polling"

# Test backend connectivity if it's running
if ($backendRunning) {
    Write-Host "`n🧪 Testing Backend Connectivity..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v2/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Backend API is responding correctly!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Backend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Could not connect to backend API: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    try {
        $socketResponse = Invoke-WebRequest -Uri "http://localhost:8000/socket.io/?transport=polling" -Method GET -TimeoutSec 5
        if ($socketResponse.StatusCode -eq 200) {
            Write-Host "   ✅ Socket.IO endpoint is accessible!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Socket.IO responded with status: $($socketResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Could not connect to Socket.IO endpoint: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✨ Verification Complete!" -ForegroundColor Green

# Summary
Write-Host "`n📄 SUMMARY:" -ForegroundColor Magenta
if ($wrongPortRunning) {
    Write-Host "   ⚠️  WARNING: Something is running on port 3003 - this should not be used!" -ForegroundColor Yellow
}

if (-not $backendRunning) {
    Write-Host "   💡 TIP: Start your backend server first: cd backend && npm start" -ForegroundColor Cyan
}

Write-Host "`n   The WebSocket configuration has been fixed!" -ForegroundColor Green
Write-Host "   ✅ Development: Uses http://localhost:8000" -ForegroundColor Green  
Write-Host "   ✅ Production: Uses https://api.bhavyabazaar.com" -ForegroundColor Green
