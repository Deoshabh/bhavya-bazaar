#!/bin/sh
set -e

echo "🚀 Starting Bhavya Bazaar Frontend..."

# Ensure nginx configuration is correct for SPA routing
echo "🔧 Configuring nginx for SPA routing..."

# Create default.conf if it doesn't exist
cat > /etc/nginx/conf.d/default.conf << 'EOF'
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

    # Handle React SPA routing - CRITICAL FIX for 404 errors
    location / {
        try_files $uri $uri/ @fallback;
        
        # No-cache for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }
    }

    # Fallback location for SPA routes - PREVENTS 404 ON REFRESH
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

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration error!"
    exit 1
fi

# Set proper permissions
chmod -R 755 /usr/share/nginx/html
chown -R nginx:nginx /usr/share/nginx/html

echo "✅ Frontend configuration complete"
echo "🌐 Starting nginx..."

# Start nginx in foreground
exec nginx -g 'daemon off;'
