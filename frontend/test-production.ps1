# Test script for verifying production build and server
# Run this locally before deploying to Coolify

# Set environment variables
$env:NODE_ENV = "production"
$env:REACT_APP_API_URL = "https://api.bhavyabazaar.com"
$env:REACT_APP_SOCKET_URL = "wss://bhavyabazaar.com:3003"
$env:GENERATE_SOURCEMAP = "false"

# Navigate to frontend directory
cd c:\Users\gagan\Desktop\bhavya-bazaar\frontend

# Create a clean production build
Write-Host "Creating production build..." -ForegroundColor Green
npm run build

# Check if build was successful
if (Test-Path -Path "build\index.html") {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Start the production server
    Write-Host "Starting production server..." -ForegroundColor Green
    Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    node server.js
} else {
    Write-Host "Build failed. Check for errors above." -ForegroundColor Red
}
