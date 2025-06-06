# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3 && \
    npm config set registry https://registry.npmjs.org/

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Copy Docker environment file for build
COPY .env.docker .env

# Build the application
RUN CI=false npm run build

# Production stage
FROM nginx:alpine

# Add curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy docker entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create nginx directories with proper permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Add labels for better container management
LABEL maintainer="Bhavya Bazaar Team" \
      version="1.0" \
      description="Bhavya Bazaar Frontend Production Container"

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
