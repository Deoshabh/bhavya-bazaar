#!/bin/sh
set -e

# Function to retry commands with exponential backoff
retry_command() {
    local max_attempts=${3:-5}
    local timeout=${2:-3}
    local attempt=1
    local output=
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt of $max_attempts: $1"
        output=$($1 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "Command succeeded!"
            echo "$output"
            return 0
        fi
        
        echo "Command failed. Retrying in $timeout seconds..."
        sleep $timeout
        
        attempt=$((attempt + 1))
        timeout=$((timeout * 2))
    done
    
    echo "Command '$1' failed after $max_attempts attempts"
    echo "Last output: $output"
    return 1
}

# Check SSL certificates
echo "Checking SSL certificates..."
if [ ! -f "/etc/nginx/ssl/cert.pem" ] || [ ! -f "/etc/nginx/ssl/key.pem" ]; then
    echo "Warning: SSL certificates not found. Using HTTP only."
fi

# Get the main.js file path from the build directory
MAIN_JS=$(find /usr/share/nginx/html/static/js -name "main.*.js" | head -1)

if [ -z "$MAIN_JS" ]; then
    echo "Error: Could not find main.js file"
    exit 1
fi

echo "Found main.js at $MAIN_JS"

# Create runtime environment configuration
cat > /usr/share/nginx/html/runtime-config.js << EOF
// runtime-config.js - Configuration for Bhavya Bazaar frontend
window.RUNTIME_CONFIG = {
  API_URL: "${API_URL:-https://api.bhavyabazaar.com/api/v2}",
  SOCKET_URL: "${SOCKET_URL:-wss://api.bhavyabazaar.com/ws}",
  BACKEND_URL: "${BACKEND_URL:-https://api.bhavyabazaar.com}",
  ENV: "${NODE_ENV:-production}",
  DEBUG: false
};
EOF

# Add runtime config script reference to index.html if not already present
grep -q 'runtime-config.js' /usr/share/nginx/html/index.html || \
    sed -i 's|</head>|<script src="/runtime-config.js"></script></head>|' /usr/share/nginx/html/index.html

# Create health check page
cat > /usr/share/nginx/html/health.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
</head>
<body>
    Health check passed
</body>
</html>
EOF

# Test API connectivity with retry
echo "Testing API connectivity..."
if retry_command "curl -sf -k --max-time 10 ${API_URL:-https://api.bhavyabazaar.com/api/v2}/health" 5 3; then
    echo "✅ API is accessible"
else
    echo "⚠️ Warning: API endpoint may not be accessible"
fi

echo "Environment configuration complete. Starting Nginx..."

# Start Nginx
exec nginx -g 'daemon off;'
