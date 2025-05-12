#!/bin/sh
# This script updates runtime environment variables in the frontend build

# Replace environment variables in the main.js file
echo "Updating environment variables..."

# Get the main.js file path from the build directory
MAIN_JS=$(find /usr/share/nginx/html/static/js -name "main.*.js" | head -1)

if [ -z "$MAIN_JS" ]; then
  echo "Error: Could not find main.js file"
  exit 1
fi

echo "Found main.js at $MAIN_JS"

# Create or update the runtime environment configuration
echo "window.runtimeEnvironment = {" > /usr/share/nginx/html/runtime-config.js
echo "  API_URL: \"${API_URL:-https://api.bhavyabazaar.com}\"," >> /usr/share/nginx/html/runtime-config.js
echo "  SOCKET_URL: \"${SOCKET_URL:-wss://bhavyabazaar.com:3003}\"," >> /usr/share/nginx/html/runtime-config.js
echo "  ENV: \"${NODE_ENV:-production}\"," >> /usr/share/nginx/html/runtime-config.js
echo "  SERVER_TIMESTAMP: \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" >> /usr/share/nginx/html/runtime-config.js
echo "};" >> /usr/share/nginx/html/runtime-config.js

# Add runtime config script reference to index.html
sed -i 's|</head>|<script src="/runtime-config.js"></script></head>|' /usr/share/nginx/html/index.html

# Replace API URL and Socket URL placeholders with environment variables in main.js
if [ ! -z "$API_URL" ]; then
  echo "Setting API_URL to $API_URL"
  sed -i "s|https://api\.bhavyabazaar\.com|${API_URL}|g" $MAIN_JS
else
  echo "API_URL not set, using default"
fi

if [ ! -z "$SOCKET_URL" ]; then
  echo "Setting SOCKET_URL to $SOCKET_URL"
  sed -i "s|wss://bhavyabazaar\.com:3003|${SOCKET_URL}|g" $MAIN_JS
else
  echo "SOCKET_URL not set, using default"
fi

# Fix common issues with cookies
echo "Adding cookie compatibility fix"
sed -i "s|withCredentials:true|withCredentials:true,headers:{'Accept':'application/json','Content-Type':'application/json'}|g" $MAIN_JS

# Test API connectivity
echo "Testing API connectivity..."
curl -s -o /dev/null -w "%{http_code}" -m 5 "https://api.bhavyabazaar.com/api/v2/user/getuser" || echo "Warning: API endpoint may not be accessible (code $?)"

echo "Environment configuration complete."
echo "Starting Nginx..."

# Execute the CMD
exec "$@"
