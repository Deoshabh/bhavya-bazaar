# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Check for and fix merge conflict markers
RUN find . -type f -name "*.jsx" -exec grep -l "<<<<<<< HEAD" {} \; | xargs -r sed -i 's/<<<<<<< HEAD//g' || true
RUN find . -type f -name "*.jsx" -exec grep -l "=======" {} \; | xargs -r sed -i 's/=======//g' || true
RUN find . -type f -name "*.jsx" -exec grep -l ">>>>>>> " {} \; | xargs -r sed -i 's/>>>>>>> .*//g' || true

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
