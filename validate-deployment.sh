#!/bin/bash

# JagaSuara Deployment Validation Script
# This script helps validate your JagaSuara deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${SERVICE_FQDN_APP:-"localhost:3000"}
PROTOCOL="https"
if [[ "$DOMAIN" == "localhost"* ]]; then
    PROTOCOL="http"
fi

BASE_URL="${PROTOCOL}://${DOMAIN}"

echo -e "${BLUE}🔍 JagaSuara Deployment Validation${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "Testing domain: ${YELLOW}$DOMAIN${NC}"
echo -e "Base URL: ${YELLOW}$BASE_URL${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -e "${BLUE}Testing ${description}...${NC}"
    
    if curl -s -f -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ ${description} - OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ${description} - FAILED${NC}"
        return 1
    fi
}

# Function to test with response
test_endpoint_with_response() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}Testing ${description}...${NC}"
    
    response=$(curl -s "${BASE_URL}${endpoint}" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == "ERROR" ]]; then
        echo -e "${RED}❌ ${description} - Connection failed${NC}"
        return 1
    elif echo "$response" | grep -q '"status":"ok"'; then
        echo -e "${GREEN}✅ ${description} - OK${NC}"
        echo -e "${GREEN}   Response: $response${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  ${description} - Unexpected response${NC}"
        echo -e "${YELLOW}   Response: $response${NC}"
        return 1
    fi
}

# Test Docker container
echo -e "${BLUE}Checking Docker container...${NC}"
if docker ps | grep -q jagasuara; then
    echo -e "${GREEN}✅ Docker container is running${NC}"
    
    # Get container info
    container_id=$(docker ps | grep jagasuara | awk '{print $1}')
    echo -e "${GREEN}   Container ID: $container_id${NC}"
else
    echo -e "${RED}❌ Docker container is not running${NC}"
    echo -e "${YELLOW}   Available containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""

# Test endpoints
echo -e "${BLUE}Testing application endpoints...${NC}"
echo ""

# Test main application
test_endpoint "/" "Main application"

# Test health endpoint with response
test_endpoint_with_response "/api/health" "Health check endpoint"

# Test admin panel
test_endpoint "/admin" "Admin panel"

echo ""

# Network tests
if command -v docker &> /dev/null; then
    echo -e "${BLUE}Checking Docker network...${NC}"
    if docker network ls | grep -q coolify; then
        echo -e "${GREEN}✅ Coolify network exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Coolify network not found${NC}"
        echo -e "${YELLOW}   Available networks:${NC}"
        docker network ls
    fi
    echo ""
fi

# Environment validation
echo -e "${BLUE}Environment validation...${NC}"
if [[ -z "$SERVICE_FQDN_APP" ]]; then
    echo -e "${YELLOW}⚠️  SERVICE_FQDN_APP not set (using localhost)${NC}"
else
    echo -e "${GREEN}✅ SERVICE_FQDN_APP: $SERVICE_FQDN_APP${NC}"
fi

if [[ -z "$NEXT_PUBLIC_APP_URL" ]]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL not set${NC}"
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL${NC}"
fi

if [[ -z "$GEMINI_API_KEY" ]]; then
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY not set (AI features disabled)${NC}"
else
    echo -e "${GREEN}✅ GEMINI_API_KEY configured${NC}"
fi

echo ""

# Final summary
echo -e "${BLUE}🎯 Validation Summary${NC}"
echo -e "${BLUE}===================${NC}"

if curl -s -f "${BASE_URL}/api/health" &>/dev/null; then
    echo -e "${GREEN}🎉 Deployment appears to be working correctly!${NC}"
    echo -e "${GREEN}   Access your application at: ${BASE_URL}${NC}"
    echo -e "${GREEN}   Admin panel: ${BASE_URL}/admin${NC}"
else
    echo -e "${RED}❌ Deployment has issues that need attention${NC}"
    echo -e "${RED}   Please check the errors above and refer to COOLIFY_README.md${NC}"
fi

echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo -e "   ${YELLOW}docker logs jagasuara-app-1${NC} - View application logs"
echo -e "   ${YELLOW}docker ps | grep jagasuara${NC} - Check container status"
echo -e "   ${YELLOW}curl ${BASE_URL}/api/health${NC} - Test health endpoint"
echo ""
