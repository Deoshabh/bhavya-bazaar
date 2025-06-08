# Multi-stage build for React + Node.js production server
FROM node:18-alpine AS builder

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set fund false && \
    npm config set audit false

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit --no-fund --silent

# Copy source code
COPY . .

# Copy environment file for build
COPY .env.docker .env

# Build the application
RUN CI=false npm run build

# Production stage - Node.js server (NOT nginx)
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --no-fund --silent

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Copy production server
COPY production-server.js ./

# Copy runtime configuration
COPY --from=builder /app/build/runtime-config.js ./build/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 80 (standard HTTP port for Coolify)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:80/health', (res) => { if (res.statusCode === 200) process.exit(0); else process.exit(1); }).on('error', () => process.exit(1));"

# Add labels
LABEL maintainer="Bhavya Bazaar Team" \
      version="2.0" \
      description="Bhavya Bazaar Frontend - Node.js SPA Server"

# Start the Node.js server (SPA routing built-in!)
CMD ["node", "production-server.js"]
