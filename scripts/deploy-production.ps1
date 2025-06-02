# Production Deployment Script for Bhavya Bazaar (PowerShell)
# Usage: .\scripts\deploy-production.ps1

param(
    [switch]$SkipBackup = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Bhavya Bazaar Production Deployment..." -ForegroundColor Green

# Configuration
$ComposeFile = "docker-compose.prod.yml"
$BackupDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LogFile = ".\logs\deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Create directories
New-Item -ItemType Directory -Force -Path "logs", "backups" | Out-Null

# Function to log messages
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    $logMessage | Out-File -FilePath $LogFile -Append
}

# Function to check if service is healthy
function Test-ServiceHealth {
    param([string]$Service)
    $maxAttempts = 30
    $attempt = 1
    
    Write-Log "Checking health of $Service..."
    
    while ($attempt -le $maxAttempts) {
        try {
            $result = docker-compose -f $ComposeFile exec $Service curl -f "http://localhost/health" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✅ $Service is healthy"
                return $true
            }
        }
        catch {
            # Continue to next attempt
        }
        
        Write-Log "⏳ Attempt $attempt/$maxAttempts`: $Service not ready yet..."
        Start-Sleep -Seconds 10
        $attempt++
    }
    
    Write-Log "❌ $Service failed health check"
    return $false
}

try {
    # Pre-deployment checks
    Write-Log "🔍 Running pre-deployment checks..."

    # Check if Docker is running
    try {
        docker info | Out-Null
    }
    catch {
        Write-Log "❌ Docker is not running"
        exit 1
    }

    # Check if compose file exists
    if (-not (Test-Path $ComposeFile)) {
        Write-Log "❌ Docker compose file not found: $ComposeFile"
        exit 1
    }

    # Backup current state
    if (-not $SkipBackup) {
        $runningContainers = docker-compose -f $ComposeFile ps --services --filter "status=running"
        if ($runningContainers) {
            Write-Log "📦 Creating backup..."
            New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
            
            # Backup database
            try {
                docker-compose -f $ComposeFile exec mongo mongodump --out "/tmp/backup" | Out-Null
                $mongoContainer = docker-compose -f $ComposeFile ps -q mongo
                docker cp "${mongoContainer}:/tmp/backup" "$BackupDir\mongo_backup" | Out-Null
            }
            catch {
                Write-Log "⚠️ Warning: Could not backup database"
            }
            
            # Backup uploads
            try {
                $backendContainer = docker-compose -f $ComposeFile ps -q backend
                docker cp "${backendContainer}:/app/uploads" "$BackupDir\uploads_backup" | Out-Null
            }
            catch {
                Write-Log "⚠️ Warning: Could not backup uploads"
            }
            
            Write-Log "✅ Backup created at $BackupDir"
        }
    }

    # Pull latest images
    Write-Log "⬇️ Pulling latest images..."
    docker-compose -f $ComposeFile pull

    # Deploy services
    Write-Log "🚀 Deploying services..."
    docker-compose -f $ComposeFile up -d --remove-orphans

    # Wait for services to be ready
    Write-Log "⏳ Waiting for services to be healthy..."
    Start-Sleep -Seconds 30

    # Health checks
    $frontendHealthy = Test-ServiceHealth "frontend"
    $backendHealthy = Test-ServiceHealth "backend"

    if ($frontendHealthy -and $backendHealthy) {
        Write-Log "✅ All services are healthy"
        
        # Cleanup old images
        Write-Log "🧹 Cleaning up old images..."
        docker image prune -f | Out-Null
        
        Write-Log "🎉 Deployment completed successfully!"
        Write-Log "🌐 Frontend: http://localhost"
        Write-Log "🔗 Backend API: http://localhost:8000"
        
    } else {
        Write-Log "❌ Deployment failed - services are not healthy"
        
        # Show logs for debugging
        Write-Log "📋 Showing service logs..."
        docker-compose -f $ComposeFile logs --tail=50
        
        exit 1
    }

    Write-Log "📊 Deployment Summary:"
    docker-compose -f $ComposeFile ps

} catch {
    Write-Log "❌ Deployment failed with error: $_"
    exit 1
}
