# Coolify Deployment Configuration Script (PowerShell)
# This script should be run during deployment to configure the runtime settings

param(
    [string]$ApiUrl = $env:API_URL,
    [string]$SocketUrl = $env:SOCKET_URL,
    [string]$BackendUrl = $env:BACKEND_URL
)

Write-Host "Configuring runtime environment for Coolify deployment..."
Write-Host "API_URL: $ApiUrl"
Write-Host "SOCKET_URL: $SocketUrl" 
Write-Host "BACKEND_URL: $BackendUrl"

# Update runtime configuration if build directory exists
if (Test-Path "build") {
    Write-Host "Updating runtime configuration in build directory..."
    
    # Create runtime config with actual values
    $runtimeConfig = @"
// Runtime configuration for Coolify deployment
window.runtimeConfig = {
  API_URL: '$ApiUrl',
  SOCKET_URL: '$SocketUrl',
  BACKEND_URL: '$BackendUrl',
  ENV: 'production',
  DEBUG: false
};

console.log('Coolify runtime config loaded:', window.runtimeConfig);
"@

    $runtimeConfig | Out-File -FilePath "build\runtime-config.js" -Encoding utf8
    Write-Host "Runtime configuration updated successfully"
} else {
    Write-Host "Build directory not found. Make sure to run 'npm run build' first."
    exit 1
}

Write-Host "Deployment configuration complete!"
