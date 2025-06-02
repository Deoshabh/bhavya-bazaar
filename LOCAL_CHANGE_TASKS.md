# Local Change Tasks Checklist

This checklist outlines all required local edits and file creations to prepare the bhavya-bazaar application for production deployment.

## 🔧 Backend CORS Configuration

### Install CORS Package
- [ ] Navigate to `backend/` directory
- [ ] Run `npm install cors` to add CORS middleware
- [ ] Verify `cors` is added to `backend/package.json` dependencies

### Configure CORS Middleware
- [ ] Edit `backend/server.js`
- [ ] Import cors: `const cors = require('cors');`
- [ ] Add CORS configuration before routes:
  ```javascript
  app.use(cors({
    origin: ['https://bhavyabazaar.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

## 🌐 Frontend API URL Updates

### Update API Base URL Configuration
- [ ] Edit `frontend/src/api.js` (or equivalent API config file)
- [ ] Change base URL from localhost to `https://api.bhavyabazaar.com/api`
- [ ] Ensure all API endpoints use the new base URL

### Search and Replace API URLs
- [ ] Search project for `localhost:8000` or similar local API URLs
- [ ] Replace with `https://api.bhavyabazaar.com/api`
- [ ] Check files in `frontend/src/` directory:
  - [ ] `api.js`
  - [ ] All component files making API calls
  - [ ] Redux action files
  - [ ] Any configuration files

### Environment Configuration
- [ ] Create/update `frontend/.env.production`:
  ```
  REACT_APP_API_URL=https://api.bhavyabazaar.com/api
  REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com
  ```
- [ ] Create/update `frontend/.env.development`:
  ```
  REACT_APP_API_URL=http://localhost:8000/api
  REACT_APP_SOCKET_URL=http://localhost:8000
  ```

## 🖼️ Static Assets Configuration

### Move Images to Public Directory
- [ ] Create `frontend/public/images/` directory if it doesn't exist
- [ ] Move static images from `frontend/src/assets/` to `frontend/public/images/`
- [ ] Update image references in components:
  - [ ] Change `import image from '../assets/image.png'` to `src="/images/image.png"`
  - [ ] Use process.env.PUBLIC_URL for dynamic paths: `${process.env.PUBLIC_URL}/images/image.png`

### Update Placeholder Images
- [ ] Verify these files are in `frontend/public/`:
  - [ ] `cosmetics-placeholder.svg`
  - [ ] `gifts-placeholder.svg`
  - [ ] `laptop-placeholder.svg`
  - [ ] `shoes-placeholder.svg`
  - [ ] `main.png`
  - [ ] `favicon.webp`

### Fix Asset Imports in Components
- [ ] Search for `../assets/` or `./assets/` imports
- [ ] Replace with public URL references or proper imports
- [ ] Update any hardcoded asset paths in CSS files

## 🐳 Docker Configuration

### Create Multi-stage Dockerfile
- [ ] Create/update `frontend/Dockerfile`:
  ```dockerfile
  # Build stage
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build

  # Production stage
  FROM nginx:alpine
  COPY --from=builder /app/build /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

### Create Nginx Configuration
- [ ] Create/update `frontend/nginx.conf`:
  ```nginx
  events {
    worker_connections 1024;
  }

  http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
      listen 80;
      server_name localhost;
      root /usr/share/nginx/html;
      index index.html;

      # Cache static assets for 30 days
      location /static/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
      }

      # Cache images for 30 days
      location /images/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
      }

      # Handle React routing - fallback to index.html
      location / {
        try_files $uri $uri/ /index.html;
      }

      # Security headers
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;

      # Gzip compression
      gzip on;
      gzip_vary on;
      gzip_min_length 1024;
      gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    }
  }
  ```

### Create Docker Ignore File
- [ ] Create/update `frontend/.dockerignore`:
  ```
  node_modules
  build
  .git
  .gitignore
  README.md
  *.log
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  .env*
  .DS_Store
  .vscode
  coverage
  .nyc_output
  ```

## 🔧 Additional Configuration Tasks

### Update Package.json Scripts
- [ ] Edit `frontend/package.json`
- [ ] Ensure build script uses production environment:
  ```json
  {
    "scripts": {
      "build": "GENERATE_SOURCEMAP=false react-scripts build",
      "build:prod": "NODE_ENV=production npm run build"
    }
  }
  ```

### Environment Variables Setup
- [ ] Create `frontend/.env.example`:
  ```
  REACT_APP_API_URL=https://api.bhavyabazaar.com/api
  REACT_APP_SOCKET_URL=https://api.bhavyabazaar.com
  ```

### Update WebSocket Configuration
- [ ] Edit `frontend/src/WebSocketClient.js`
- [ ] Update WebSocket URL to use environment variable:
  ```javascript
  const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';
  ```

## 📋 Testing Checklist

### Local Testing
- [ ] Test CORS configuration with frontend
- [ ] Verify all API calls work with new URLs
- [ ] Check that all images load correctly
- [ ] Test React routing works properly

### Docker Testing
- [ ] Build Docker image: `docker build -t bhavya-bazaar-frontend .`
- [ ] Run container: `docker run -p 8080:80 bhavya-bazaar-frontend`
- [ ] Test application at `http://localhost:8080`
- [ ] Verify static assets serve correctly
- [ ] Test React routing (refresh on different routes)

### Production Readiness
- [ ] Verify no console errors in browser
- [ ] Check Network tab for failed requests
- [ ] Confirm proper HTTPS redirects
- [ ] Test mobile responsiveness
- [ ] Validate performance metrics

## 🚀 Deployment Preparation

### Final Checks
- [ ] All localhost references removed
- [ ] Environment variables properly configured
- [ ] Build process completes without errors
- [ ] Docker image builds successfully
- [ ] Nginx serves static files correctly
- [ ] CORS allows production domain

### Documentation Updates
- [ ] Update README.md with new deployment instructions
- [ ] Document environment variables
- [ ] Add Docker run commands
- [ ] Include troubleshooting section

---

**Note**: Complete tasks in order and test each section before proceeding to the next. Mark items as complete with `[x]` when finished.
