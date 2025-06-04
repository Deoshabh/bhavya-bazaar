# Script to prepare and build frontend with correct API URL configuration

Write-Host "=============================" -ForegroundColor Cyan
Write-Host "BUILDING FRONTEND FOR PRODUCTION" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Directory paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Get-Item $scriptDir).Parent.FullName
$runtimeConfig = Join-Path -Path $rootDir -ChildPath "public\runtime-config.js"
$buildConfig = Join-Path -Path $rootDir -ChildPath "build\runtime-config.js"

# Default API URL if not set
$apiUrl = if ($env:REACT_APP_API_URL) { $env:REACT_APP_API_URL } else { "https://api.bhavyabazaar.com/api/v2" }
$socketUrl = if ($env:REACT_APP_SOCKET_URL) { $env:REACT_APP_SOCKET_URL } else { "wss://api.bhavyabazaar.com/ws" }
$backendUrl = if ($env:REACT_APP_BACKEND_URL) { $env:REACT_APP_BACKEND_URL } else { "https://api.bhavyabazaar.com" }

Write-Host "Using API URL: $apiUrl" -ForegroundColor Yellow
Write-Host "Using Socket URL: $socketUrl" -ForegroundColor Yellow
Write-Host "Using Backend URL: $backendUrl" -ForegroundColor Yellow

# Generate runtime config content
$runtimeConfigContent = @"
// filepath: runtime-config.js
window.RUNTIME_CONFIG = {
  API_URL: "$apiUrl",
  SOCKET_URL: "$socketUrl",
  BACKEND_URL: "$backendUrl",
  ENV: "production",
  DEBUG: false
};
"@

# Check if public/runtime-config.js exists and update it
if (Test-Path -Path $runtimeConfig) {
    Write-Host "Updating $runtimeConfig..." -ForegroundColor Green
    Set-Content -Path $runtimeConfig -Value $runtimeConfigContent
    Write-Host "Updated runtime config in public folder" -ForegroundColor Green
}
else {
    Write-Host "Creating $runtimeConfig..." -ForegroundColor Green
    New-Item -Path (Split-Path -Parent $runtimeConfig) -ItemType Directory -Force | Out-Null
    Set-Content -Path $runtimeConfig -Value $runtimeConfigContent
    Write-Host "Created runtime config in public folder" -ForegroundColor Green
}

# Run the build
Write-Host "Starting production build..." -ForegroundColor Cyan
$env:CI = "false"
$env:GENERATE_SOURCEMAP = "false" 
$env:NODE_ENV = "production"

# Change to frontend directory
Set-Location -Path $rootDir

# Run npm build command
npm run build

# Ensure the runtime-config.js is correctly set in the build folder
if (Test-Path -Path (Split-Path -Parent $buildConfig)) {
    Write-Host "Ensuring build folder has correct runtime-config.js..." -ForegroundColor Green
    Set-Content -Path $buildConfig -Value $runtimeConfigContent
    Write-Host "Updated runtime config in build folder" -ForegroundColor Green
}
else {
    Write-Host "ERROR: Build folder not found. Build may have failed." -ForegroundColor Red
    exit 1
}

Write-Host "=============================" -ForegroundColor Cyan
Write-Host "BUILD COMPLETED" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
