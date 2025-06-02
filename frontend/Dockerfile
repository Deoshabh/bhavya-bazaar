# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy source files
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
ENV REACT_APP_SOCKET_URL=wss://api.bhavyabazaar.com:3003
ENV REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install only the minimal required packages
RUN apk add --no-cache curl

# Copy the build output from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create simple health check file
RUN echo "OK" > /usr/share/nginx/html/health.txt

# Expose HTTP port (SSL termination is handled by Coolify)
EXPOSE 80

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/health.txt || exit 1

# Start nginx with daemon off
CMD ["nginx", "-g", "daemon off;"]
