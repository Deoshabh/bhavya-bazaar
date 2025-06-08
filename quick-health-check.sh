#!/bin/bash

# Bhavya Bazaar Production Diagnostic Script
# Run this script to quickly check if all services are healthy

echo "🚀 Bhavya Bazaar Production Health Check"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URLs
BACKEND_URL="https://api.bhavyabazaar.com"
FRONTEND_URL="https://bhavyabazaar.com"

echo -e "\n${BLUE}🏥 Testing Backend Health...${NC}"
HEALTH_RESPONSE=$(curl -s -o /tmp/health_response.txt -w "%{http_code}" "$BACKEND_URL/api/v2/health")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend Health: OK${NC}"
    cat /tmp/health_response.txt | jq . 2>/dev/null || cat /tmp/health_response.txt
else
    echo -e "${RED}❌ Backend Health: FAILED (HTTP $HEALTH_RESPONSE)${NC}"
    echo "💡 Action needed: Fix backend service in Coolify"
    cat /tmp/health_response.txt 2>/dev/null
fi

echo -e "\n${BLUE}🔌 Testing Socket Status...${NC}"
SOCKET_RESPONSE=$(curl -s -o /tmp/socket_response.txt -w "%{http_code}" "$BACKEND_URL/socket/status")

if [ "$SOCKET_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Socket Status: OK${NC}"
    cat /tmp/socket_response.txt | jq . 2>/dev/null || cat /tmp/socket_response.txt
else
    echo -e "${RED}❌ Socket Status: FAILED (HTTP $SOCKET_RESPONSE)${NC}"
    cat /tmp/socket_response.txt 2>/dev/null
fi

echo -e "\n${BLUE}🌐 Testing API Endpoints...${NC}"

# Test products endpoint
PRODUCTS_RESPONSE=$(curl -s -o /tmp/products_response.txt -w "%{http_code}" "$BACKEND_URL/api/v2/product/get-all-products")
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Products API: OK${NC}"
else
    echo -e "${RED}❌ Products API: FAILED (HTTP $PRODUCTS_RESPONSE)${NC}"
fi

echo -e "\n${BLUE}🖥️  Testing Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend: OK${NC}"
else
    echo -e "${RED}❌ Frontend: FAILED (HTTP $FRONTEND_RESPONSE)${NC}"
fi

echo -e "\n${BLUE}🔍 Testing DNS Resolution...${NC}"
if nslookup api.bhavyabazaar.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS Resolution: OK${NC}"
    echo "   $(nslookup api.bhavyabazaar.com | grep -A1 "Name:" | tail -1)"
else
    echo -e "${RED}❌ DNS Resolution: FAILED${NC}"
fi

echo -e "\n${BLUE}📊 Summary${NC}"
echo "=========="

# Count successes
SUCCESS_COUNT=0
TOTAL_TESTS=5

if [ "$HEALTH_RESPONSE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$SOCKET_RESPONSE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$PRODUCTS_RESPONSE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$FRONTEND_RESPONSE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if nslookup api.bhavyabazaar.com > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi

if [ "$SUCCESS_COUNT" = "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED ($SUCCESS_COUNT/$TOTAL_TESTS)${NC}"
    echo -e "${GREEN}✅ Your WebSocket and API issues are RESOLVED!${NC}"
elif [ "$SUCCESS_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS ($SUCCESS_COUNT/$TOTAL_TESTS)${NC}"
    echo -e "${YELLOW}💡 Some services need attention${NC}"
else
    echo -e "${RED}❌ ALL TESTS FAILED ($SUCCESS_COUNT/$TOTAL_TESTS)${NC}"
    echo -e "${RED}🚨 CRITICAL: Backend service appears to be down${NC}"
fi

echo -e "\n${BLUE}🔧 Quick Fix Commands:${NC}"
echo "====================="
echo "1. Check Coolify backend service status"
echo "2. Restart backend service if needed"
echo "3. Verify environment variables in Coolify"
echo "4. Run this script again to verify fixes"

echo -e "\n${BLUE}🌐 Quick Browser Tests:${NC}"
echo "======================"
echo "• Backend Health: $BACKEND_URL/api/v2/health"
echo "• Socket Status: $BACKEND_URL/socket/status"
echo "• Frontend: $FRONTEND_URL"
echo "• Diagnostic Tool: file://$(pwd)/diagnostic-tool.html"

# Cleanup temp files
rm -f /tmp/health_response.txt /tmp/socket_response.txt /tmp/products_response.txt

echo -e "\n${GREEN}Diagnostic complete!${NC}"
