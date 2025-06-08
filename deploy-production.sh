#!/bin/bash

# Production Deployment Script for Bhavya Bazaar
# This script sets up the complete production environment with WebSocket support

set -e

echo "🚀 Starting Bhavya Bazaar Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx nodejs npm mongodb redis-server certbot python3-certbot-nginx

# Install PM2 globally for process management
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directory
APP_DIR="/var/www/bhavyabazaar"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r frontend $APP_DIR/
cp -r backend $APP_DIR/
cp nginx.conf /tmp/nginx-bhavyabazaar.conf

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production

# Install frontend dependencies and build
print_status "Building frontend application..."
cd $APP_DIR/frontend
npm install
npm run build

# Copy built frontend to nginx directory
print_status "Setting up frontend files..."
sudo cp -r build/* $APP_DIR/frontend/

# Set up environment files
print_status "Setting up environment configuration..."
cd $APP_DIR/backend
if [ ! -f .env ]; then
    cp .env.production .env
    print_warning "Please edit $APP_DIR/backend/.env with your actual configuration values"
fi

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bhavya-bazaar-backend',
    script: './backend/server.js',
    cwd: '/var/www/bhavyabazaar',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p $APP_DIR/logs

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp /tmp/nginx-bhavyabazaar.conf /etc/nginx/sites-available/bhavyabazaar
sudo ln -sf /etc/nginx/sites-available/bhavyabazaar /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Update nginx configuration with correct paths
sudo sed -i "s|/var/www/bhavyabazaar/frontend|$APP_DIR/frontend|g" /etc/nginx/sites-available/bhavyabazaar

# Test nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start and enable services
print_status "Starting and enabling services..."

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Start PM2 application
print_status "Starting backend application with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx

# Setup SSL certificate with Let's Encrypt
print_status "Setting up SSL certificate..."
print_warning "Please ensure your domain is pointing to this server before proceeding with SSL setup"
read -p "Do you want to set up SSL certificate now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d bhavyabazaar.com -d www.bhavyabazaar.com
fi

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Final status check
print_status "Checking service status..."
echo "MongoDB Status:"
sudo systemctl status mongod --no-pager -l

echo "Redis Status:"
sudo systemctl status redis-server --no-pager -l

echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo "PM2 Status:"
pm2 status

print_status "Deployment completed! 🎉"
print_status "Your application should now be accessible at:"
print_status "  - https://bhavyabazaar.com"
print_status "  - https://www.bhavyabazaar.com"
print_status ""
print_status "WebSocket endpoints:"
print_status "  - Socket.IO: wss://bhavyabazaar.com/socket.io"
print_status "  - Native WebSocket: wss://bhavyabazaar.com/ws"
print_status ""
print_warning "Remember to:"
print_warning "  1. Update your environment variables in $APP_DIR/backend/.env"
print_warning "  2. Configure your MongoDB database"
print_warning "  3. Set up your email SMTP settings"
print_warning "  4. Update SSL certificate paths in nginx configuration if needed"
print_warning ""
print_status "Useful commands:"
print_status "  - View backend logs: pm2 logs bhavya-bazaar-backend"
print_status "  - Restart backend: pm2 restart bhavya-bazaar-backend"
print_status "  - View nginx logs: sudo tail -f /var/log/nginx/access.log"
print_status "  - Test nginx config: sudo nginx -t"
