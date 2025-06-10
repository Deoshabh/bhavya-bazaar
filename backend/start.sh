#!/bin/bash

# Coolify deployment startup script for Bhavya Bazaar Backend
# This script ensures proper environment setup and server startup

echo "🚀 Starting Bhavya Bazaar Backend Server..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Set default values if not provided
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-8000}

# Ensure logs directory exists
mkdir -p logs

# Install dependencies if needed (for Coolify deployments)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Check if MongoDB connection string is available
if [ -z "$DB_URI" ]; then
    echo "❌ ERROR: DB_URI environment variable is not set!"
    exit 1
fi

# Check if required secrets are available
if [ -z "$JWT_SECRET_KEY" ]; then
    echo "❌ ERROR: JWT_SECRET_KEY environment variable is not set!"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "❌ ERROR: SESSION_SECRET environment variable is not set!"
    exit 1
fi

# Log startup information
echo "🔗 MongoDB URI: ${DB_URI:0:20}..."
echo "🔑 JWT Secret: ${JWT_SECRET_KEY:0:10}..."
echo "🍪 Session Secret: ${SESSION_SECRET:0:10}..."
echo "🌐 CORS Origins: $CORS_ORIGIN"

# Start the server with proper error handling
echo "🎯 Starting Node.js server on port $PORT..."
node server.js

# If we reach here, the server has exited
echo "❌ Server process has exited"
exit 1
