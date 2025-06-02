# Bhavya Bazaar Development Server Status Check
Write-Host "Bhavya Bazaar Development Server Status Check" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to check if a port is listening
function Test-Port {
    param($Port, $ServerName)
    
    $result = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ $ServerName (Port $Port): RUNNING" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $ServerName (Port $Port): NOT RUNNING" -ForegroundColor Red
        return $false
    }
}

# Check all servers
$backendStatus = Test-Port -Port 8000 -ServerName "Backend Server (with Socket.IO)"
$frontendStatus = Test-Port -Port 3000 -ServerName "Frontend Server"

Write-Host ""

# MongoDB status
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction Stop
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB Service: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB Service: STOPPED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MongoDB Service: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "Node.js Processes:" -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName -AutoSize

if ($backendStatus -and $frontendStatus) {
    Write-Host "All servers are running successfully!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend API (with Socket.IO): http://localhost:8000/api/v2" -ForegroundColor Cyan
    Write-Host "Socket Status: http://localhost:8000/socket/status" -ForegroundColor Cyan
} else {
    Write-Host "Some servers are not running. Please check the logs." -ForegroundColor Yellow
}
