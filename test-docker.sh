#!/bin/bash

# Test script for Docker build
echo "🧪 Testing Docker build for Bhavya Bazaar..."

# Build the image
echo "🔨 Building Docker image..."
docker build -t bhavya-bazaar-test:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test run the container
    echo "🚀 Testing container startup..."
    docker run -d --name bhavya-test -p 8000:8000 bhavya-bazaar-test:latest
    
    # Wait for startup
    echo "⏳ Waiting for container to start..."
    sleep 15
    
    # Test health endpoint
    echo "🩺 Testing health endpoint..."
    if curl -f http://localhost:8000/api/v2/health; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed!"
        docker logs bhavya-test
    fi
    
    # Test frontend serving
    echo "🌐 Testing frontend serving..."
    if curl -f http://localhost:8000/; then
        echo "✅ Frontend serving works!"
    else
        echo "❌ Frontend serving failed!"
    fi
    
    # Cleanup
    echo "🧹 Cleaning up..."
    docker stop bhavya-test
    docker rm bhavya-test
    
else
    echo "❌ Docker build failed!"
    exit 1
fi

echo "🎉 Test completed!"
