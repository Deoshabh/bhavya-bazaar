const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();

// Enable compression for all responses
app.use(compression());

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Set caching headers for static assets
app.use((req, res, next) => {
  if (req.url.match(/^\/(static|assets)\//)) {
    // Use aggressive caching in production, less aggressive in development
    if (isProduction) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
  next();
});

// Health check endpoint for Coolify
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Always return the main index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Get port from environment variable or use 3000 as default
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Using NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Log the contents of the build directory
  if (fs.existsSync(path.join(__dirname, 'build'))) {
    console.log('Build directory exists');
    const files = fs.readdirSync(path.join(__dirname, 'build'));
    console.log('Build directory contents:', files);
  } else {
    console.error('Build directory does not exist');
  }
});
