#!/bin/bash

# Production Deployment Script for Bhavya Bazaar
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Starting Bhavya Bazaar Production Deployment..."

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Create directories
mkdir -p logs backups

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if service is healthy
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log "Checking health of $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec "$service" curl -f http://localhost/health &>/dev/null; then
            log "✅ $service is healthy"
            return 0
        fi
        
        log "⏳ Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    log "❌ $service failed health check"
    return 1
}

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if Docker is running
if ! docker info &>/dev/null; then
    log "❌ Docker is not running"
    exit 1
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log "❌ Docker compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Backup current state
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    log "📦 Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    docker-compose -f "$COMPOSE_FILE" exec mongo mongodump --out "/tmp/backup" &>/dev/null || true
    docker cp "$(docker-compose -f "$COMPOSE_FILE" ps -q mongo)":/tmp/backup "$BACKUP_DIR/mongo_backup" || true
    
    # Backup uploads
    docker cp "$(docker-compose -f "$COMPOSE_FILE" ps -q backend)":/app/uploads "$BACKUP_DIR/uploads_backup" || true
    
    log "✅ Backup created at $BACKUP_DIR"
fi

# Pull latest images
log "⬇️ Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Deploy services
log "🚀 Deploying services..."
docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Wait for services to be ready
log "⏳ Waiting for services to be healthy..."
sleep 30

# Health checks
if check_health "frontend" && check_health "backend"; then
    log "✅ All services are healthy"
    
    # Cleanup old images
    log "🧹 Cleaning up old images..."
    docker image prune -f
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Frontend: http://localhost"
    log "🔗 Backend API: http://localhost:8000"
    
else
    log "❌ Deployment failed - services are not healthy"
    
    # Show logs for debugging
    log "📋 Showing service logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    
    exit 1
fi

log "📊 Deployment Summary:"
docker-compose -f "$COMPOSE_FILE" ps
