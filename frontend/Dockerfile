# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Check for and fix merge conflicts in all JavaScript files
RUN find src -type f -name "*.js*" -exec grep -l "<<<<<<< HEAD" {} \; | xargs -r sed -i -e '/<<<<<<< HEAD/,/>>>>>>>/c\import { Link, useParams } from "react-router-dom";' || true

# Build the application
RUN REACT_APP_API_URL=https://api.bhavyabazaar.com REACT_APP_SOCKET_URL=wss://bhavyabazaar.com:3003 npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add runtime script to handle environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variables for runtime
ENV API_URL=https://api.bhavyabazaar.com
ENV SOCKET_URL=wss://bhavyabazaar.com:3003

# Expose port 80
EXPOSE 80

# Start Nginx server with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
