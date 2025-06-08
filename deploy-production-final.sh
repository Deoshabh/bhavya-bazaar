#!/bin/bash

# Bhavya Bazaar - Production Deployment Script
# This script helps deploy the production build

set -e  # Exit on any error

echo "🚀 Bhavya Bazaar Production Deployment"
echo "======================================"

# Check if build directory exists
if [ ! -d "frontend/build" ]; then
    echo "❌ Build directory not found!"
    echo "Please run 'npm run build' in the frontend directory first"
    exit 1
fi

echo "✅ Production build found"

# Display build information
echo ""
echo "📦 Build Information:"
echo "-------------------"
echo "Build created: $(stat -c %y frontend/build 2>/dev/null || stat -f %Sm frontend/build)"
echo "Main bundle: $(ls -lh frontend/build/static/js/main.*.js | awk '{print $5}')"
echo "Vendor bundle: $(ls -lh frontend/build/static/js/vendors.*.js | awk '{print $5}')"

# Display runtime configuration
echo ""
echo "⚙️  Runtime Configuration:"
echo "-------------------------"
grep -E "(API_URL|SOCKET_URL|NODE_ENV)" frontend/build/runtime-config.js || echo "Configuration file not found"

echo ""
echo "🎯 Deployment Ready!"
echo ""
echo "Next Steps:"
echo "1. Upload the contents of 'frontend/build/' to your web server"
echo "2. Ensure the web server serves index.html for all routes (SPA routing)"
echo "3. Test the authentication flow thoroughly"
echo "4. Monitor for any console errors"
echo ""
echo "🔗 Key URLs to verify after deployment:"
echo "- Login page: https://bhavyabazaar.com/login"
echo "- API health: https://api.bhavyabazaar.com/health"
echo "- WebSocket: wss://api.bhavyabazaar.com/socket.io"
echo ""
echo "📊 Expected fixes after deployment:"
echo "✅ Authentication login loop resolved"
echo "✅ Optimized production bundles loaded"
echo "✅ WebSocket connections working"
echo "✅ Proper error handling"
