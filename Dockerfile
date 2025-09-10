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

# Set frontend build environment variables
ENV CI=false
ENV COOKIE_DOMAIN=.bhavyabazaar.com
ENV CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3004,http://localhost:3004
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_TIMEOUT=15000
ENV REACT_APP_API_URL=https://api.bhavyabazaar.com/api/v2
ENV REACT_APP_BACKEND_URL=https://api.bhavyabazaar.com
ENV REACT_APP_DEBUG=false
ENV REACT_APP_ENABLE_ANALYTICS=true
ENV REACT_APP_ENABLE_EXHIBITOR_FEATURES=true
ENV REACT_APP_ENV=production
ENV REACT_APP_SECURE=true
ENV REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com
ENV REACT_APP_SOKETI_APP_ID=Js3axIJci9Zlwl88
ENV REACT_APP_SOKETI_APP_KEY=TzBt
ENV REACT_APP_SOKETI_CLUSTER=mt1
ENV REACT_APP_SOKETI_HOST=soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io
ENV REACT_APP_SOKETI_PATH=/ws
ENV REACT_APP_SOKETI_PORT=443
ENV REACT_APP_SOKETI_TLS=true
ENV REACT_APP_USE_SOKETI=true

# Build the React application
RUN npm run build

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

# Set backend environment variables for production
ENV ACTIVATION_SECRET=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
ENV ADMIN_SECRET_KEY=bhavya_bazaar_admin_2025_secure_key
ENV API_URL=https://api.bhavyabazaar.com
ENV AUTH_RATE_LIMIT_MAX=20
ENV AUTH_RATE_LIMIT_WINDOW=900000
ENV BACKEND_URL=https://api.bhavyabazaar.com
ENV BCRYPT_ROUNDS=12
ENV COOKIE_DOMAIN=.bhavyabazaar.com
ENV CORS_ORIGIN=https://bhavyabazaar.com,https://www.bhavyabazaar.com,https://api.bhavyabazaar.com,http://localhost:3000,http://localhost:3004
ENV DB_URI=mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bazzar?authSource=admin
ENV ENABLE_CACHE_WARMING=true
ENV FROM_EMAIL=noreply@bhavyabazaar.com
ENV FRONTEND_URL=https://bhavyabazaar.com
ENV JWT_EXPIRES=7d
ENV JWT_SECRET_KEY=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
ENV MAX_FILE_SIZE=5242880
ENV NODE_ENV=production
ENV PORT=8000
ENV REDIS_DB=0
ENV REDIS_HOST=r0sssg8g8wog48ggcgc0s4go
ENV REDIS_PASSWORD=ey66XSWpPTBQuAzKdWRWBD3oHwr5p4iSUie5DRoLoIKgeZM4YZoSufSQEw9Mp3c4
ENV REDIS_PORT=6379
ENV SESSION_SECRET=d025bc0cc32caef23fc9c85211b78a6f730edbc321e601422f27f2587eedab17
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PASS=your-app-password
ENV SMTP_PORT=587
ENV SMTP_USER=your-email@gmail.com
ENV SOCKET_URL=https://api.bhavyabazaar.com
ENV SOKETI_APP_ID=Js3axIJci9Zlwl88
ENV SOKETI_APP_KEY=TzBt
ENV SOKETI_CLUSTER=mt1
ENV SOKETI_HOST=soketi-u40wwkwwws04os4cg8sgsws4.147.79.66.75.sslip.io
ENV SOKETI_PATH=/ws
ENV SOKETI_PORT=443
ENV SOKETI_TLS=true
ENV SUPER_ADMIN_SECRET_KEY=bhavya_bazaar_super_admin_2025_ultra_secure_key
ENV UPLOAD_PATH=./uploads

# Expose port 8000 as specified
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/v2/health || exit 1

# Add labels for better container management
LABEL maintainer="Bhavya Bazaar Team" \
    version="1.0" \
    description="Bhavya Bazaar Full-Stack Application for Dokploy" \
    port="8000"

# Start the application
CMD ["npm", "start"]
