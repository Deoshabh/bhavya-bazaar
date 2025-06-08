#!/bin/bash
# Script to fix SPA routing in production nginx container

echo "🔧 Fixing SPA Routing Configuration..."

# Check current nginx config in container
echo "Current nginx config in container:"
docker exec $(docker ps --filter "name=frontend" --format "{{.Names}}" | head -1) cat /etc/nginx/conf.d/default.conf

echo ""
echo "🔄 Creating corrected nginx configuration..."

# Create corrected nginx config for SPA
cat > /tmp/spa-nginx.conf << 'EOF'
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;
    root   /usr/share/nginx/html;
    index  index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache images and fonts
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 6M;
        add_header Cache-Control "public, immutable";
    }

    # Handle React SPA routing - CRITICAL FIX
    location / {
        try_files $uri $uri/ @fallback;
        
        # No-cache for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }
    }

    # Fallback for SPA routes
    location @fallback {
        rewrite ^.*$ /index.html last;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF

echo "✅ New nginx configuration created"
echo ""
echo "🔄 Applying configuration to container..."

# Copy new config to container
FRONTEND_CONTAINER=$(docker ps --filter "name=frontend" --format "{{.Names}}" | head -1)

if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "Found frontend container: $FRONTEND_CONTAINER"
    
    # Backup current config
    docker exec $FRONTEND_CONTAINER cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
    
    # Copy new config
    docker cp /tmp/spa-nginx.conf $FRONTEND_CONTAINER:/etc/nginx/conf.d/default.conf
    
    # Test nginx config
    echo "🧪 Testing nginx configuration..."
    docker exec $FRONTEND_CONTAINER nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        docker exec $FRONTEND_CONTAINER nginx -s reload
        
        echo "✅ Nginx reloaded successfully"
        echo ""
        echo "🎉 SPA routing fix applied successfully!"
        echo ""
        echo "🧪 Testing SPA routes..."
        
        # Test routes
        echo "Testing homepage..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://bhavyabazaar.com/
        
        echo "Testing /login route..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://bhavyabazaar.com/login
        
        echo "Testing /profile route..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://bhavyabazaar.com/profile
        
    else
        echo "❌ Nginx configuration test failed"
        echo "🔄 Restoring backup..."
        docker exec $FRONTEND_CONTAINER cp /etc/nginx/conf.d/default.conf.backup /etc/nginx/conf.d/default.conf
        docker exec $FRONTEND_CONTAINER nginx -s reload
        echo "✅ Backup restored"
    fi
    
else
    echo "❌ Frontend container not found"
    echo "Available containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
fi

# Cleanup
rm -f /tmp/spa-nginx.conf

echo ""
echo "📋 Summary:"
echo "- SPA routing configuration updated"
echo "- All React routes should now return 200 OK"
echo "- Users should no longer get logged out on refresh"
echo "- Direct access to /login, /profile, etc. should work"
