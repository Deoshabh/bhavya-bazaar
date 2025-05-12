#!/bin/sh
set -e

# Check SSL certificates
echo "Checking SSL certificates..."
if [ ! -f "/etc/nginx/ssl/cert.pem" ] || [ ! -f "/etc/nginx/ssl/key.pem" ]; then
    echo "Error: SSL certificates not found!"
    exit 1
fi

# Verify SSL certificate permissions
chmod 600 /etc/nginx/ssl/key.pem
chmod 644 /etc/nginx/ssl/cert.pem

# Get the main.js file path from the build directory
MAIN_JS=$(find /usr/share/nginx/html/static/js -name "main.*.js" | head -1)

if [ -z "$MAIN_JS" ]; then
    echo "Error: Could not find main.js file"
    exit 1
fi

echo "Found main.js at $MAIN_JS"

# Create runtime environment configuration
cat > /usr/share/nginx/html/runtime-config.js << EOF
window.runtimeEnvironment = {
    API_URL: "${API_URL:-https://api.bhavyabazaar.com}",
    SOCKET_URL: "${SOCKET_URL:-wss://api.bhavyabazaar.com:3003}",
    ENV: "${NODE_ENV:-production}",
    SERVER_TIMESTAMP: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
};
EOF

# Add runtime config script reference to index.html if not already present
grep -q 'runtime-config.js' /usr/share/nginx/html/index.html || \
    sed -i 's|</head>|<script src="/runtime-config.js"></script></head>|' /usr/share/nginx/html/index.html

# Update main.js with environment variables
if [ ! -z "$API_URL" ]; then
    echo "Setting API_URL to $API_URL"
    sed -i "s|https://api\.bhavyabazaar\.com|${API_URL}|g" $MAIN_JS
fi

if [ ! -z "$SOCKET_URL" ]; then
    echo "Setting SOCKET_URL to $SOCKET_URL"
    sed -i "s|wss://api\.bhavyabazaar\.com:3003|${SOCKET_URL}|g" $MAIN_JS
fi

# Add CORS and cookie handling improvements
echo "Adding security and cookie handling improvements"
sed -i 's|withCredentials:true|withCredentials:true,headers:{"Accept":"application/json","Content-Type":"application/json","X-Requested-With":"XMLHttpRequest"}|g' $MAIN_JS

# Test connectivity
echo "Testing API connectivity..."
if curl -sf -k --max-time 5 "https://api.bhavyabazaar.com/api/v2/" > /dev/null; then
    echo "API is accessible"
else
    echo "Warning: API endpoint may not be accessible"
fi

echo "Testing WebSocket connectivity..."
if curl -sf -k --max-time 5 -H "Connection: Upgrade" -H "Upgrade: websocket" "https://api.bhavyabazaar.com:3003/" > /dev/null; then
    echo "WebSocket endpoint is accessible"
else
    echo "Warning: WebSocket endpoint may not be accessible"
fi

echo "Environment configuration complete. Starting Nginx..."
exec nginx -g 'daemon off;'
