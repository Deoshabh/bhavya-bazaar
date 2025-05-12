#!/bin/bash

# Production build script for Coolify deployment

# Install dependencies
npm ci --legacy-peer-deps

# Build the production version
export NODE_ENV=production
npm run build

# Create a server to serve the static files
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();

// Enable compression for all responses
app.use(compression());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Set caching headers for static assets
app.use((req, res, next) => {
  if (req.url.match(/^\/(static|assets)\//)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// Always return the main index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Get port from environment variable or use 3000 as default
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
EOF

# Add Express and compression to dependencies
npm install --save express compression
