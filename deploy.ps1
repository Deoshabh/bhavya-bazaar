# Bhavya Bazaar Deployment Script for Dokploy (PowerShell)
# This script helps with building and deploying the application on Windows

param(
    [switch]$SkipTest = $false
)

Write-Host "🚀 Starting Bhavya Bazaar deployment preparation..." -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if environment file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your actual configuration before deployment." -ForegroundColor Cyan
}

# Build the Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Blue
docker build -t bhavya-bazaar:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Test the image (optional)
if (-not $SkipTest) {
    Write-Host "🧪 Testing Docker image..." -ForegroundColor Blue
    docker run --rm -d --name bhavya-bazaar-test -p 5001:5001 --env-file .env bhavya-bazaar:latest

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start test container!" -ForegroundColor Red
        exit 1
    }

    # Wait a bit for the container to start
    Write-Host "⏳ Waiting for container to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    # Check if the container is running
    $runningContainer = docker ps --filter "name=bhavya-bazaar-test" --format "{{.Names}}"
    
    if ($runningContainer -eq "bhavya-bazaar-test") {
        Write-Host "✅ Container is running successfully!" -ForegroundColor Green
        Write-Host "🌐 Application should be accessible at http://localhost:5001" -ForegroundColor Cyan
        
        # Stop the test container
        docker stop bhavya-bazaar-test | Out-Null
        Write-Host "🛑 Test container stopped." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Container failed to start. Check the logs:" -ForegroundColor Red
        docker logs bhavya-bazaar-test
        docker rm -f bhavya-bazaar-test 2>$null
        exit 1
    }
}

Write-Host "✅ Deployment preparation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps for Dokploy deployment:" -ForegroundColor Cyan
Write-Host "1. Push your code to your Git repository"
Write-Host "2. Create a new application in Dokploy"
Write-Host "3. Connect your Git repository"
Write-Host "4. Set build source to 'Dockerfile'"
Write-Host "5. Configure environment variables (see .env.example)"
Write-Host "6. Set port to 5001"
Write-Host "7. Deploy!"
Write-Host ""
Write-Host "📚 For detailed instructions, see DOKPLOY_DEPLOYMENT.md" -ForegroundColor Yellow

# Optional: Open the deployment guide
$openGuide = Read-Host "Would you like to open the deployment guide? (y/N)"
if ($openGuide -eq "y" -or $openGuide -eq "Y") {
    if (Test-Path "DOKPLOY_DEPLOYMENT.md") {
        Start-Process "DOKPLOY_DEPLOYMENT.md"
    }
}
