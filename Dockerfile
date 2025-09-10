# Multi-stage Dockerfile for Bhavya Bazaar deployment on Dokploy
# This Dockerfile builds both frontend and backend in a single container

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Configure npm for better network handling
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3 && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set fund false && \
    npm config set audit false

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --prefer-offline --no-audit --no-fund --silent

# Copy frontend source code
COPY frontend/ ./

# Build the React application
RUN CI=false GENERATE_SOURCEMAP=false NODE_ENV=production npm run build

# Stage 2: Build Backend and Final Image
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies (production only)
RUN npm ci --only=production --prefer-offline --no-audit --no-fund --silent

# Copy backend source code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/build ./public

# Create necessary directories
RUN mkdir -p uploads && \
    mkdir -p logs

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set proper permissions
RUN chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5001
ENV MONGODB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_bazaar?authSource=admin

# Expose port 5001 as specified
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5001/api/v2/health || exit 1

# Add labels for better container management
LABEL maintainer="Bhavya Bazaar Team" \
    version="1.0" \
    description="Bhavya Bazaar Full-Stack Application for Dokploy" \
    port="5001"

# Start the application
CMD ["npm", "start"]
