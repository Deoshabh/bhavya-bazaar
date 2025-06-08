#!/usr/bin/env powershell

# 🧪 Test Node.js Production Server Locally

Write-Host "🧪 Testing Node.js production server locally..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend\production-server.js")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Change to frontend directory
Set-Location frontend

Write-Host "📦 Checking if build exists..." -ForegroundColor Cyan
if (-not (Test-Path "build")) {
    Write-Host "⚠️ Build directory not found. Building React app..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Build directory exists" -ForegroundColor Green
}

Write-Host "🚀 Starting Node.js production server..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Set environment variables for testing
$env:NODE_ENV = "production"
$env:PORT = "3001"  # Use 3001 to avoid conflicts

Write-Host "🌐 Starting server on http://localhost:3001" -ForegroundColor Green
Write-Host "📋 Test these URLs:" -ForegroundColor Yellow
Write-Host "  • http://localhost:3001 (homepage)" -ForegroundColor White
Write-Host "  • http://localhost:3001/login (SPA route)" -ForegroundColor White
Write-Host "  • http://localhost:3001/profile (SPA route)" -ForegroundColor White
Write-Host "  • http://localhost:3001/health (health check)" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Start the server
node production-server.js
