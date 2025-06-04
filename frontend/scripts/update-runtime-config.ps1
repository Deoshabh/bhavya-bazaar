# Runtime Configuration Manager
# This script updates the runtime-config.js files in both public and build directories
# with consistent configuration values.

# Display banner
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   RUNTIME CONFIGURATION MANAGER" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Get paths
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Get-Item $rootDir).Parent.FullName
$publicConfigPath = Join-Path -Path $projectRoot -ChildPath "public\runtime-config.js"
$buildConfigPath = Join-Path -Path $projectRoot -ChildPath "build\runtime-config.js"

Write-Host "Project root: $projectRoot" -ForegroundColor Yellow
Write-Host "Public config: $publicConfigPath" -ForegroundColor Yellow
Write-Host "Build config: $buildConfigPath" -ForegroundColor Yellow

# Get runtime configuration values
$apiUrl = $env:REACT_APP_API_URL
if (-not $apiUrl) {
    $apiUrl = "https://api.bhavyabazaar.com/api/v2"
    Write-Host "Using default API URL: $apiUrl" -ForegroundColor Yellow
} else {
    Write-Host "Using environment API URL: $apiUrl" -ForegroundColor Green
}

$socketUrl = $env:REACT_APP_SOCKET_URL
if (-not $socketUrl) {
    $socketUrl = "wss://api.bhavyabazaar.com/ws"
    Write-Host "Using default Socket URL: $socketUrl" -ForegroundColor Yellow
} else {
    Write-Host "Using environment Socket URL: $socketUrl" -ForegroundColor Green
}

$backendUrl = $env:REACT_APP_BACKEND_URL
if (-not $backendUrl) {
    $backendUrl = "https://api.bhavyabazaar.com"
    Write-Host "Using default Backend URL: $backendUrl" -ForegroundColor Yellow
} else {
    Write-Host "Using environment Backend URL: $backendUrl" -ForegroundColor Green
}

$version = $env:REACT_APP_VERSION
if (-not $version) {
    $version = "1.0.0"
    Write-Host "Using default version: $version" -ForegroundColor Yellow
} else {
    Write-Host "Using environment version: $version" -ForegroundColor Green
}

$buildTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
Write-Host "Build timestamp: $buildTime" -ForegroundColor Yellow

$debug = $env:REACT_APP_DEBUG -eq "true"
Write-Host "Debug mode: $debug" -ForegroundColor Yellow

# Create runtime config content
$configContent = @"
/**
 * Runtime configuration for Bhavya Bazaar
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Generated on: $buildTime
 */

// Define runtime configuration
window.__RUNTIME_CONFIG__ = {
  // API URL
  API_URL: "$apiUrl",
  
  // Socket URL for real-time communication
  SOCKET_URL: "$socketUrl",
  
  // Base URL for assets and uploads
  BACKEND_URL: "$backendUrl",
  
  // Environment indicator
  NODE_ENV: "production",
  
  // Feature flags
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: true
  },
  
  // Version info for debugging
  VERSION: "$version",
  
  // Build timestamp
  BUILD_TIME: "$buildTime",
  
  // Debug mode
  DEBUG: $($debug.ToString().ToLower())
};

// Backward compatibility for code still using RUNTIME_CONFIG without the double underscore
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;
"@

# Create development version with environment variable fallbacks
$devConfigContent = @"
/**
 * Runtime configuration for Bhavya Bazaar (Development)
 * This file provides runtime configuration values that can be changed without rebuilding the application
 * Values will be available as window.__RUNTIME_CONFIG__ in the browser
 * Generated on: $buildTime
 */

// Define runtime configuration with fallbacks
window.__RUNTIME_CONFIG__ = {
  // API URL with fallbacks (runtime > env > hardcoded)
  API_URL: process.env.REACT_APP_API_URL || "$apiUrl",
  
  // Socket URL for real-time communication
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || "$socketUrl",
  
  // Base URL for assets and uploads
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "$backendUrl",
  
  // Environment indicator
  NODE_ENV: process.env.NODE_ENV || "production",
  
  // Feature flags
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: process.env.NODE_ENV === "production"
  },
  
  // Version info for debugging
  VERSION: process.env.REACT_APP_VERSION || "$version",
  
  // Build timestamp
  BUILD_TIME: process.env.REACT_APP_BUILD_TIME || "$buildTime",
  
  // Debug mode (disabled by default in production)
  DEBUG: process.env.REACT_APP_DEBUG === "true" || false
};

// Backward compatibility for code still using RUNTIME_CONFIG without the double underscore
window.RUNTIME_CONFIG = window.__RUNTIME_CONFIG__;

// Log configuration in non-production environments
if (window.__RUNTIME_CONFIG__.NODE_ENV !== "production") {
  console.log("Runtime configuration loaded:", window.__RUNTIME_CONFIG__);
}
"@

# Update public config file
try {
    Set-Content -Path $publicConfigPath -Value $devConfigContent -Encoding UTF8
    Write-Host "✅ Public runtime-config.js updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update public runtime-config.js: $_" -ForegroundColor Red
}

# Update build config file if it exists
if (Test-Path $buildConfigPath) {
    try {
        Set-Content -Path $buildConfigPath -Value $configContent -Encoding UTF8
        Write-Host "✅ Build runtime-config.js updated successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to update build runtime-config.js: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Build directory does not exist yet. Only public config updated." -ForegroundColor Yellow
}

Write-Host "`nRuntime configuration update complete!" -ForegroundColor Cyan
