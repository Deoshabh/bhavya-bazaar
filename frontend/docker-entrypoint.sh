#!/bin/sh
# This script updates the runtime environment variables in the frontend build

# Replace environment variables in the main.js file
echo "Updating environment variables..."

# Get the main.js file path from the build directory
MAIN_JS=$(find /usr/share/nginx/html/static/js -name "main.*.js" | head -1)

if [ -z "$MAIN_JS" ]; then
  echo "Error: Could not find main.js file"
  exit 1
fi

echo "Found main.js at $MAIN_JS"

# Replace API URL and Socket URL placeholders with environment variables
sed -i "s|https://api\.bhavyabazaar\.com|${API_URL}|g" $MAIN_JS
sed -i "s|wss://bhavyabazaar\.com:3003|${SOCKET_URL}|g" $MAIN_JS

echo "Environment variables updated successfully."

# Execute the CMD
exec "$@"
