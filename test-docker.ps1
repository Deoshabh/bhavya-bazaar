# Test script for Docker build (PowerShell)
Write-Host "🧪 Testing Docker build for Bhavya Bazaar..." -ForegroundColor Green

# Build the image
Write-Host "🔨 Building Docker image..." -ForegroundColor Blue
docker build -t bhavya-bazaar-test:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker build successful!" -ForegroundColor Green
    
    # Test run the container
    Write-Host "🚀 Testing container startup..." -ForegroundColor Blue
    docker run -d --name bhavya-test -p 8000:8000 bhavya-bazaar-test:latest
    
    if ($LASTEXITCODE -eq 0) {
        # Wait for startup
        Write-Host "⏳ Waiting for container to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Test health endpoint
        Write-Host "🩺 Testing health endpoint..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v2/health" -Method Get -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Health check passed!" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Health check failed! Status: $($response.StatusCode)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Health check failed! Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "📋 Container logs:" -ForegroundColor Yellow
            docker logs bhavya-test
        }
        
        # Test frontend serving
        Write-Host "🌐 Testing frontend serving..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/" -Method Get -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend serving works!" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Frontend serving failed! Status: $($response.StatusCode)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Frontend serving failed! Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Cleanup
        Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
        docker stop bhavya-test | Out-Null
        docker rm bhavya-test | Out-Null
    }
    else {
        Write-Host "❌ Container failed to start!" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Test completed!" -ForegroundColor Green
