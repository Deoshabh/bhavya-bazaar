#!/bin/bash

# Coolify Deployment Verification Script
# This script helps verify your Bhavya Bazaar deployment on Coolify

echo "🚀 Bhavya Bazaar - Coolify Deployment Verification"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://bhavyabazaar.com}"
API_URL="${API_URL:-https://api.bhavyabazaar.com/api/v2}"
BACKEND_URL="${BACKEND_URL:-https://api.bhavyabazaar.com}"

echo "Testing URLs:"
echo "Frontend: $FRONTEND_URL"
echo "API: $API_URL" 
echo "Backend: $BACKEND_URL"
echo ""

# Function to test URL
test_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    # Test with timeout
    if curl -sf --max-time 10 --connect-timeout 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to test with status code
test_with_status() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --connect-timeout 5 "$url" 2>/dev/null)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "302" ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $status_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $status_code)${NC}"
        return 1
    fi
}

echo "🔍 HEALTH CHECKS"
echo "=================="

# Frontend health check
test_with_status "$FRONTEND_URL/health" "Frontend Health"

# Frontend main page
test_with_status "$FRONTEND_URL/" "Frontend Main Page"

# API health check (if available)
test_with_status "$API_URL/health" "API Health"

# Backend health check
test_with_status "$BACKEND_URL/health" "Backend Health"

echo ""
echo "🖼️  IMAGE LOADING TESTS"
echo "======================="

# Test static brand logos
brand_logos=("apple-logo.png" "dell-logo.png" "lg-logo.png" "microsoft-logo.png" "sony-logo.png")

for logo in "${brand_logos[@]}"; do
    test_with_status "$FRONTEND_URL/brand-logos/$logo" "Brand Logo: $logo"
done

echo ""
echo "⚙️  CONFIGURATION TESTS"
echo "======================="

# Test runtime config
echo -n "Testing Runtime Configuration... "
config_response=$(curl -s --max-time 10 "$FRONTEND_URL/runtime-config.js" 2>/dev/null)

if echo "$config_response" | grep -q "RUNTIME_CONFIG" && echo "$config_response" | grep -q "API_URL"; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "   API_URL found in runtime config"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   Runtime config missing or invalid"
fi

# Test if runtime config has proper values
echo -n "Checking Runtime Config Values... "
if echo "$config_response" | grep -q "https://" && ! echo "$config_response" | grep -q "process.env"; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "   No process.env references found (browser compatible)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   May contain browser-incompatible references"
fi

echo ""
echo "🌐 NETWORK CONNECTIVITY"
echo "======================="

# Test API endpoints
api_endpoints=("/health" "/api/v2/products" "/api/v2/shops")

for endpoint in "${api_endpoints[@]}"; do
    test_with_status "$BACKEND_URL$endpoint" "API Endpoint: $endpoint"
done

echo ""
echo "📱 FRONTEND FUNCTIONALITY"
echo "========================="

# Test main JavaScript bundle
echo -n "Testing Main JS Bundle... "
main_js_response=$(curl -s --max-time 10 "$FRONTEND_URL/static/js/main.*.js" 2>/dev/null | head -c 100)

if [ -n "$main_js_response" ]; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Test CSS bundle
echo -n "Testing CSS Bundle... "
css_response=$(curl -s --max-time 10 "$FRONTEND_URL/static/css/main.*.css" 2>/dev/null | head -c 100)

if [ -n "$css_response" ]; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
echo "🔒 SECURITY CHECKS"
echo "=================="

# Test HTTPS redirect
echo -n "Testing HTTPS Redirect... "
http_url=$(echo "$FRONTEND_URL" | sed 's/https:/http:/')
redirect_response=$(curl -s -I --max-time 10 "$http_url" 2>/dev/null | grep -i "location:")

if echo "$redirect_response" | grep -q "https://"; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "   HTTP correctly redirects to HTTPS"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   HTTPS redirect may not be configured"
fi

# Test security headers
echo -n "Testing Security Headers... "
security_headers=$(curl -s -I --max-time 10 "$FRONTEND_URL/" 2>/dev/null)

if echo "$security_headers" | grep -qi "x-frame-options\|x-content-type-options\|strict-transport-security"; then
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "   Security headers found"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Some security headers may be missing"
fi

echo ""
echo "📊 SUMMARY"
echo "=========="

# Count results
total_tests=20
passed_tests=0

# Re-run quick tests to count
for url in "$FRONTEND_URL/health" "$FRONTEND_URL/" "$API_URL/health" "$BACKEND_URL/health"; do
    if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
        ((passed_tests++))
    fi
done

echo "Tests Passed: $passed_tests/4 (Core Functionality)"

if [ $passed_tests -eq 4 ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT STATUS: HEALTHY${NC}"
    echo "✅ Your Bhavya Bazaar application appears to be running correctly!"
elif [ $passed_tests -ge 2 ]; then
    echo -e "${YELLOW}⚠️  DEPLOYMENT STATUS: PARTIAL${NC}"
    echo "⚠️  Some services may need attention"
else
    echo -e "${RED}❌ DEPLOYMENT STATUS: ISSUES DETECTED${NC}"
    echo "❌ Multiple services appear to be down"
fi

echo ""
echo "🔧 TROUBLESHOOTING TIPS"
echo "======================="
echo "If tests failed:"
echo "1. Check Coolify logs for error messages"
echo "2. Verify environment variables are set correctly"
echo "3. Ensure DNS records point to your VPS IP"
echo "4. Check SSL certificate status in Coolify"
echo "5. Verify backend services are running"

echo ""
echo "For detailed logs, check your Coolify dashboard."
echo "Report completed at: $(date)"
