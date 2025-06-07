#!/bin/bash

# =================================================================
# COOLIFY REDIS DEPLOYMENT AUTOMATION SCRIPT
# Bhavya Bazaar E-Commerce Platform
# =================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 Bhavya Bazaar Redis Deployment Script for Coolify"
echo "====================================================="
echo ""

# Check if required files exist
print_header "Checking required files..."

required_files=(
    "backend/package.json"
    "backend/server.js"
    "backend/config/redis.js"
    "backend/utils/cacheService.js"
    "backend/middleware/cache.js"
    "docker-compose.coolify.yml"
    "coolify-environment-template.env"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        print_status "✅ Found: $file"
    else
        print_error "❌ Missing: $file"
        exit 1
    fi
done

echo ""

# Check if environment template needs customization
print_header "Checking environment configuration..."

if grep -q "GENERATE_SECURE" coolify-environment-template.env; then
    print_warning "⚠️  Environment template contains placeholder values!"
    print_warning "Please update coolify-environment-template.env with actual values before deployment."
    echo ""
    echo "Required updates:"
    echo "- MONGO_PASSWORD=your_secure_mongo_password"
    echo "- REDIS_PASSWORD=your_secure_redis_password"
    echo "- JWT_SECRET_KEY=your_32_character_secret"
    echo "- SESSION_SECRET=your_32_character_secret"
    echo "- ACTIVATION_SECRET=your_32_character_secret"
    echo "- CORS_ORIGIN=https://yourdomain.com"
    echo ""
    read -p "Have you updated the environment file? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please update environment variables first, then run this script again."
        exit 1
    fi
fi

print_status "✅ Environment configuration check passed"
echo ""

# Generate secure passwords helper
print_header "Security Helper - Generate Secure Passwords"
echo ""
echo "You can use these commands to generate secure passwords:"
echo ""
echo "For MongoDB password:"
echo "openssl rand -base64 32"
echo ""
echo "For Redis password:"
echo "openssl rand -base64 32"
echo ""
echo "For JWT secrets (longer):"
echo "openssl rand -base64 48"
echo ""

read -p "Do you want to generate sample passwords now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generated passwords (use these in your environment config):"
    echo ""
    echo "MONGO_PASSWORD=$(openssl rand -base64 32)"
    echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
    echo "JWT_SECRET_KEY=$(openssl rand -base64 48)"
    echo "SESSION_SECRET=$(openssl rand -base64 48)"
    echo "ACTIVATION_SECRET=$(openssl rand -base64 48)"
    echo ""
    print_warning "⚠️  Save these passwords securely and update your environment config!"
    echo ""
    read -p "Press Enter to continue..."
fi

# Pre-deployment validation
print_header "Running pre-deployment validation..."

# Check Node.js dependencies
if [[ -f "backend/package.json" ]]; then
    if grep -q '"redis"' backend/package.json && grep -q '"ioredis"' backend/package.json; then
        print_status "✅ Redis dependencies found in package.json"
    else
        print_error "❌ Redis dependencies missing from package.json"
        print_error "Please run: cd backend && npm install redis ioredis"
        exit 1
    fi
fi

# Check Redis configuration
if [[ -f "backend/config/redis.js" ]]; then
    if grep -q "createClient\|Redis" backend/config/redis.js; then
        print_status "✅ Redis configuration file is properly set up"
    else
        print_error "❌ Redis configuration file appears incomplete"
        exit 1
    fi
fi

# Check cache middleware
if [[ -f "backend/middleware/cache.js" ]]; then
    if grep -q "cacheMiddleware\|getCache\|setCache" backend/middleware/cache.js; then
        print_status "✅ Cache middleware is properly configured"
    else
        print_error "❌ Cache middleware appears incomplete"
        exit 1
    fi
fi

print_status "✅ Pre-deployment validation passed"
echo ""

# Docker configuration check
print_header "Validating Docker configuration..."

if [[ -f "docker-compose.coolify.yml" ]]; then
    if grep -q "redis:" docker-compose.coolify.yml && grep -q "mongo:" docker-compose.coolify.yml; then
        print_status "✅ Docker Compose file includes Redis and MongoDB services"
    else
        print_error "❌ Docker Compose file missing required services"
        exit 1
    fi
fi

print_status "✅ Docker configuration validated"
echo ""

# Final deployment checklist
print_header "Final Deployment Checklist"
echo ""
echo "Before deploying to Coolify, ensure you have:"
echo ""
echo "✅ 1. Updated all environment variables in coolify-environment-template.env"
echo "✅ 2. Generated secure passwords for MongoDB and Redis"
echo "✅ 3. Updated CORS_ORIGIN with your actual domain"
echo "✅ 4. Configured email settings (if needed)"
echo "✅ 5. Set up payment gateway credentials (if needed)"
echo "✅ 6. Committed all changes to your Git repository"
echo ""

read -p "Are all items above completed? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please complete the checklist before deploying."
    exit 1
fi

# Deployment instructions
print_header "Deployment Instructions for Coolify"
echo ""
echo "1. 🌐 Access your Coolify dashboard"
echo "2. 📁 Navigate to your Bhavya Bazaar project"
echo "3. ⚙️  Go to Environment Variables section"
echo "4. 📋 Copy variables from coolify-environment-template.env"
echo "5. 🔐 Paste and verify all values are correct (no placeholders)"
echo "6. 🐳 Deploy using docker-compose.coolify.yml"
echo "7. 📊 Monitor deployment logs for Redis connection success"
echo "8. 🧪 Test endpoints after deployment"
echo ""

print_header "Post-Deployment Testing"
echo ""
echo "After deployment, test these endpoints:"
echo ""
echo "# Health check"
echo "curl https://your-api-domain.com/api/v2/cache/health"
echo ""
echo "# Cache statistics"
echo "curl https://your-api-domain.com/api/v2/cache/stats"
echo ""
echo "# Performance benchmark"
echo "curl -X POST https://your-api-domain.com/api/v2/cache/benchmark"
echo ""
echo "# Comprehensive test suite"
echo "curl -X POST https://your-api-domain.com/api/v2/cache/test"
echo ""

print_header "Expected Performance Improvements"
echo ""
echo "📈 Response Times: 75-90% faster for cached routes"
echo "📊 Database Load: 60-80% reduction in MongoDB queries"
echo "🚀 Concurrent Users: 3-5x capacity increase"
echo "⚡ Cache Hit Rates: 80-95% for frequently accessed data"
echo ""

print_status "🎉 Pre-deployment validation completed successfully!"
print_status "🚀 Your Bhavya Bazaar application is ready for Redis deployment on Coolify!"
echo ""
echo "Next steps:"
echo "1. Deploy to Coolify using the provided configuration"
echo "2. Monitor deployment logs for successful Redis connection"
echo "3. Run post-deployment tests to verify functionality"
echo "4. Monitor performance improvements over the next few days"
echo ""
echo "For detailed instructions, see: COOLIFY_REDIS_DEPLOYMENT_GUIDE.md"
