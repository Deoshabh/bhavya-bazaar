#!/bin/bash

# Coolify Deployment Configuration Script
# This script should be run during deployment to configure the runtime settings

# Set default values if not provided
API_URL=${API_URL:-}
SOCKET_URL=${SOCKET_URL:-}
BACKEND_URL=${BACKEND_URL:-}

echo "Configuring runtime environment for Coolify deployment..."
echo "API_URL: ${API_URL}"
echo "SOCKET_URL: ${SOCKET_URL}"
echo "BACKEND_URL: ${BACKEND_URL}"

# Update runtime configuration if build directory exists
if [ -d "build" ]; then
    echo "Updating runtime configuration in build directory..."
    
    # Create runtime config with actual values
    cat > build/runtime-config.js << EOF
// Runtime configuration for Coolify deployment
window.runtimeConfig = {
  API_URL: '${API_URL}',
  SOCKET_URL: '${SOCKET_URL}',
  BACKEND_URL: '${BACKEND_URL}',
  ENV: 'production',
  DEBUG: false
};

console.log('Coolify runtime config loaded:', window.runtimeConfig);
EOF

    echo "Runtime configuration updated successfully"
else
    echo "Build directory not found. Make sure to run 'npm run build' first."
    exit 1
fi

echo "Deployment configuration complete!"
