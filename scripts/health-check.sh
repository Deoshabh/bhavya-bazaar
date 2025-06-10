#!/bin/bash

# Backend Health Check Script
# Tests API connectivity and CORS configuration

echo "🏥 Bhavya Bazaar Backend Health Check"
echo "======================================"

API_URL="https://api.bhavyabazaar.com"
FRONTEND_URL="https://bhavyabazaar.com"

echo "Testing backend connectivity..."

# Test 1: Basic connectivity
echo -n "1. Basic connectivity test: "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v2/health" --max-time 10)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS (Status: $HTTP_STATUS)"
else
    echo "❌ FAIL (Status: $HTTP_STATUS)"
fi

# Test 2: CORS preflight
echo -n "2. CORS preflight test: "
CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$API_URL/api/v2/health" --max-time 10)
if [ "$CORS_STATUS" = "200" ] || [ "$CORS_STATUS" = "204" ]; then
    echo "✅ PASS (Status: $CORS_STATUS)"
else
    echo "❌ FAIL (Status: $CORS_STATUS)"
fi

# Test 3: Actual API request with CORS
echo -n "3. CORS API request test: "
API_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" "$API_URL/api/v2/health" --max-time 10)
if echo "$API_RESPONSE" | grep -q "healthy\|status"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
fi

# Test 4: Authentication endpoint
echo -n "4. Auth endpoint test: "
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/check" --max-time 10)
if [ "$AUTH_STATUS" = "200" ] || [ "$AUTH_STATUS" = "401" ]; then
    echo "✅ PASS (Status: $AUTH_STATUS)"
else
    echo "❌ FAIL (Status: $AUTH_STATUS)"
fi

echo ""
echo "💡 If tests are failing:"
echo "   1. Check if backend service is running in Coolify"
echo "   2. Verify environment variables are set"
echo "   3. Check Coolify service logs for errors"
echo "   4. Restart the backend service if needed"

echo ""
echo "🔗 Quick links:"
echo "   - Backend Health: $API_URL/api/v2/health"
echo "   - Frontend: $FRONTEND_URL"
echo "   - API Debug: $API_URL/api/v2/debug/env"
