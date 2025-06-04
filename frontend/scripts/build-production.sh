#!/bin/bash
# Script to prepare and build frontend with correct API URL configuration

echo "============================="
echo "BUILDING FRONTEND FOR PRODUCTION"
echo "============================="

# Directory paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
RUNTIME_CONFIG="$ROOT_DIR/public/runtime-config.js"
BUILD_CONFIG="$ROOT_DIR/build/runtime-config.js"

# Default API URL if not set
API_URL=${REACT_APP_API_URL:-"https://api.bhavyabazaar.com/api/v2"}
SOCKET_URL=${REACT_APP_SOCKET_URL:-"wss://api.bhavyabazaar.com/ws"}
BACKEND_URL=${REACT_APP_BACKEND_URL:-"https://api.bhavyabazaar.com"}

echo "Using API URL: $API_URL"
echo "Using Socket URL: $SOCKET_URL" 
echo "Using Backend URL: $BACKEND_URL"

# Check if public/runtime-config.js exists and update it
if [ -f "$RUNTIME_CONFIG" ]; then
  echo "Updating $RUNTIME_CONFIG..."
  cat > "$RUNTIME_CONFIG" << EOF
// filepath: $(basename "$RUNTIME_CONFIG")
window.RUNTIME_CONFIG = {
  API_URL: "$API_URL",
  SOCKET_URL: "$SOCKET_URL",
  BACKEND_URL: "$BACKEND_URL",
  ENV: "production",
  DEBUG: false
};
EOF
  echo "Updated runtime config in public folder"
else
  echo "Creating $RUNTIME_CONFIG..."
  mkdir -p "$(dirname "$RUNTIME_CONFIG")"
  cat > "$RUNTIME_CONFIG" << EOF
// filepath: $(basename "$RUNTIME_CONFIG")
window.RUNTIME_CONFIG = {
  API_URL: "$API_URL",
  SOCKET_URL: "$SOCKET_URL",
  BACKEND_URL: "$BACKEND_URL",
  ENV: "production", 
  DEBUG: false
};
EOF
  echo "Created runtime config in public folder"
fi

# Run the build
echo "Starting production build..."
cross-env CI=false GENERATE_SOURCEMAP=false NODE_ENV=production react-app-rewired build --omit=dev

# Ensure the runtime-config.js is correctly set in the build folder
if [ -d "$ROOT_DIR/build" ]; then
  echo "Ensuring build folder has correct runtime-config.js..."
  cat > "$BUILD_CONFIG" << EOF
// filepath: $(basename "$BUILD_CONFIG")
window.RUNTIME_CONFIG = {
  API_URL: "$API_URL",
  SOCKET_URL: "$SOCKET_URL",
  BACKEND_URL: "$BACKEND_URL",
  ENV: "production",
  DEBUG: false
};
EOF
  echo "Updated runtime config in build folder"
else
  echo "ERROR: Build folder not found. Build may have failed."
  exit 1
fi

echo "============================="
echo "BUILD COMPLETED"
echo "============================="
