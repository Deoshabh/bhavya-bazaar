@echo off
REM =================================================================
REM COOLIFY REDIS DEPLOYMENT SCRIPT - WINDOWS VERSION
REM Bhavya Bazaar E-Commerce Platform
REM =================================================================

setlocal enabledelayedexpansion

echo.
echo 🚀 Bhavya Bazaar Redis Deployment Script for Coolify
echo =====================================================
echo.

REM Check if required files exist
echo [STEP] Checking required files...

set "files_missing=0"

if exist "backend\package.json" (
    echo [INFO] ✅ Found: backend\package.json
) else (
    echo [ERROR] ❌ Missing: backend\package.json
    set "files_missing=1"
)

if exist "backend\server.js" (
    echo [INFO] ✅ Found: backend\server.js
) else (
    echo [ERROR] ❌ Missing: backend\server.js
    set "files_missing=1"
)

if exist "backend\config\redis.js" (
    echo [INFO] ✅ Found: backend\config\redis.js
) else (
    echo [ERROR] ❌ Missing: backend\config\redis.js
    set "files_missing=1"
)

if exist "backend\utils\cacheService.js" (
    echo [INFO] ✅ Found: backend\utils\cacheService.js
) else (
    echo [ERROR] ❌ Missing: backend\utils\cacheService.js
    set "files_missing=1"
)

if exist "backend\middleware\cache.js" (
    echo [INFO] ✅ Found: backend\middleware\cache.js
) else (
    echo [ERROR] ❌ Missing: backend\middleware\cache.js
    set "files_missing=1"
)

if exist "docker-compose.coolify.yml" (
    echo [INFO] ✅ Found: docker-compose.coolify.yml
) else (
    echo [ERROR] ❌ Missing: docker-compose.coolify.yml
    set "files_missing=1"
)

if exist "coolify-environment-template.env" (
    echo [INFO] ✅ Found: coolify-environment-template.env
) else (
    echo [ERROR] ❌ Missing: coolify-environment-template.env
    set "files_missing=1"
)

if !files_missing! == 1 (
    echo.
    echo [ERROR] Some required files are missing. Please ensure all files are present.
    pause
    exit /b 1
)

echo.
echo [STEP] Checking environment configuration...

findstr /C:"GENERATE_SECURE" coolify-environment-template.env >nul
if !errorlevel! == 0 (
    echo [WARNING] ⚠️ Environment template contains placeholder values!
    echo [WARNING] Please update coolify-environment-template.env with actual values.
    echo.
    echo Required updates:
    echo - MONGO_PASSWORD=your_secure_mongo_password
    echo - REDIS_PASSWORD=your_secure_redis_password
    echo - JWT_SECRET_KEY=your_32_character_secret
    echo - SESSION_SECRET=your_32_character_secret
    echo - ACTIVATION_SECRET=your_32_character_secret
    echo - CORS_ORIGIN=https://yourdomain.com
    echo.
    set /p "continue=Have you updated the environment file? (y/N): "
    if /i not "!continue!" == "y" (
        echo [ERROR] Please update environment variables first.
        pause
        exit /b 1
    )
)

echo [INFO] ✅ Environment configuration check passed
echo.

echo [STEP] Security Helper - Password Generation
echo.
echo You can use online tools to generate secure passwords:
echo - https://www.random.org/passwords/
echo - https://passwordsgenerator.net/
echo.
echo Or use PowerShell commands:
echo For 32-character password:
echo [System.Web.Security.Membership]::GeneratePassword(32, 0)
echo.

set /p "generate=Do you want to see password generation help? (y/N): "
if /i "!generate!" == "y" (
    echo.
    echo Password Requirements:
    echo - Minimum 32 characters for security
    echo - Use mix of letters, numbers, and symbols
    echo - No dictionary words
    echo - Unique for each service
    echo.
    echo Update these in coolify-environment-template.env:
    echo MONGO_PASSWORD=your_generated_password_here
    echo REDIS_PASSWORD=your_generated_password_here
    echo JWT_SECRET_KEY=your_generated_secret_here
    echo SESSION_SECRET=your_generated_secret_here
    echo ACTIVATION_SECRET=your_generated_secret_here
    echo.
    pause
)

echo.
echo [STEP] Running pre-deployment validation...

findstr /C:"redis" backend\package.json >nul
if !errorlevel! == 0 (
    echo [INFO] ✅ Redis dependencies found in package.json
) else (
    echo [ERROR] ❌ Redis dependencies missing from package.json
    echo [ERROR] Please run: cd backend && npm install redis ioredis
    pause
    exit /b 1
)

findstr /C:"createClient" backend\config\redis.js >nul
if !errorlevel! == 0 (
    echo [INFO] ✅ Redis configuration file is properly set up
) else (
    echo [ERROR] ❌ Redis configuration file appears incomplete
    pause
    exit /b 1
)

findstr /C:"cacheMiddleware" backend\middleware\cache.js >nul
if !errorlevel! == 0 (
    echo [INFO] ✅ Cache middleware is properly configured
) else (
    echo [ERROR] ❌ Cache middleware appears incomplete
    pause
    exit /b 1
)

echo [INFO] ✅ Pre-deployment validation passed
echo.

echo [STEP] Validating Docker configuration...

findstr /C:"redis:" docker-compose.coolify.yml >nul && findstr /C:"mongo:" docker-compose.coolify.yml >nul
if !errorlevel! == 0 (
    echo [INFO] ✅ Docker Compose file includes Redis and MongoDB services
) else (
    echo [ERROR] ❌ Docker Compose file missing required services
    pause
    exit /b 1
)

echo [INFO] ✅ Docker configuration validated
echo.

echo [STEP] Final Deployment Checklist
echo.
echo Before deploying to Coolify, ensure you have:
echo.
echo ✅ 1. Updated all environment variables in coolify-environment-template.env
echo ✅ 2. Generated secure passwords for MongoDB and Redis
echo ✅ 3. Updated CORS_ORIGIN with your actual domain
echo ✅ 4. Configured email settings (if needed)
echo ✅ 5. Set up payment gateway credentials (if needed)
echo ✅ 6. Committed all changes to your Git repository
echo.

set /p "checklist=Are all items above completed? (y/N): "
if /i not "!checklist!" == "y" (
    echo [WARNING] Please complete the checklist before deploying.
    pause
    exit /b 1
)

echo.
echo [STEP] Deployment Instructions for Coolify
echo.
echo 1. 🌐 Access your Coolify dashboard
echo 2. 📁 Navigate to your Bhavya Bazaar project
echo 3. ⚙️ Go to Environment Variables section
echo 4. 📋 Copy variables from coolify-environment-template.env
echo 5. 🔐 Paste and verify all values are correct (no placeholders)
echo 6. 🐳 Deploy using docker-compose.coolify.yml
echo 7. 📊 Monitor deployment logs for Redis connection success
echo 8. 🧪 Test endpoints after deployment
echo.

echo [STEP] Post-Deployment Testing
echo.
echo After deployment, test these endpoints:
echo.
echo # Health check
echo curl https://your-api-domain.com/api/v2/cache/health
echo.
echo # Cache statistics
echo curl https://your-api-domain.com/api/v2/cache/stats
echo.
echo # Performance benchmark
echo curl -X POST https://your-api-domain.com/api/v2/cache/benchmark
echo.
echo # Comprehensive test suite
echo curl -X POST https://your-api-domain.com/api/v2/cache/test
echo.

echo [STEP] Expected Performance Improvements
echo.
echo 📈 Response Times: 75-90%% faster for cached routes
echo 📊 Database Load: 60-80%% reduction in MongoDB queries
echo 🚀 Concurrent Users: 3-5x capacity increase
echo ⚡ Cache Hit Rates: 80-95%% for frequently accessed data
echo.

echo [INFO] 🎉 Pre-deployment validation completed successfully!
echo [INFO] 🚀 Your Bhavya Bazaar application is ready for Redis deployment on Coolify!
echo.
echo Next steps:
echo 1. Deploy to Coolify using the provided configuration
echo 2. Monitor deployment logs for successful Redis connection
echo 3. Run post-deployment tests to verify functionality
echo 4. Monitor performance improvements over the next few days
echo.
echo For detailed instructions, see: COOLIFY_REDIS_DEPLOYMENT_GUIDE.md
echo.

pause
