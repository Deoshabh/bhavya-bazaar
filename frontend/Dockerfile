# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git libc6-compat

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Set environment variables and build
ENV NODE_ENV=production
ENV CI=false
ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
ENV REACT_APP_SOCKET_URL=wss://api.bhavyabazaar.com:3003
ENV REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install necessary tools
RUN apk add --no-cache curl ca-certificates openssl

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates (these should be mounted at runtime)
COPY ssl/cert.pem /etc/nginx/ssl/cert.pem
COPY ssl/key.pem /etc/nginx/ssl/key.pem

# Set proper permissions for SSL files
RUN chmod 600 /etc/nginx/ssl/key.pem

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add runtime script to handle environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variables for runtime
ENV API_URL=https://api.bhavyabazaar.com
ENV SOCKET_URL=wss://api.bhavyabazaar.com:3003
ENV NODE_ENV=production
ENV PORT=443

# Expose both HTTP and HTTPS ports
EXPOSE 80 443

# Create a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f --insecure https://localhost/ || exit 1

# Start Nginx server with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
