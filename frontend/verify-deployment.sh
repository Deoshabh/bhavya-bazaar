#!/bin/bash

# Bhavya Bazaar - Production Deployment Verification Script
# Run this after deploying to verify everything is working

echo "🔍 Bhavya Bazaar Deployment Verification"
echo "========================================"

# Check if production build exists
if [ -d "build" ]; then
    echo "✅ Production build directory exists"
    
    # Check key files
    if [ -f "build/index.html" ]; then
        echo "✅ index.html present"
    else
        echo "❌ index.html missing"
    fi
    
    if [ -f "build/runtime-config.js" ]; then
        echo "✅ runtime-config.js present"
        echo "📋 Runtime configuration:"
        grep -E "(API_URL|NODE_ENV)" build/runtime-config.js
    else
        echo "❌ runtime-config.js missing"
    fi
    
    # Check for production bundle
    if ls build/static/js/*.js >/dev/null 2>&1; then
        echo "✅ JavaScript bundles present"
        echo "📦 Bundle sizes:"
        ls -lh build/static/js/*.js | awk '{print $9, $5}'
    else
        echo "❌ JavaScript bundles missing"
    fi
    
else
    echo "❌ Build directory not found! Run 'npm run build' first"
    exit 1
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Upload contents of 'build/' directory to your web server"
echo "2. Test the authentication flow thoroughly"
echo "3. Monitor browser console for any errors"
echo "4. Verify all HTTP API endpoints are working properly"
