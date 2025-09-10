# Dokploy Configuration for Bhavya Bazaar

## Deployment Instructions

### 1. Prerequisites

- Dokploy installed on your VPS
- Domain configured (optional)
- SSL certificate (recommended)

### 2. Environment Variables to Set in Dokploy

```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_bazaar?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
SMPT_SERVICE=gmail
SMPT_MAIL=your-email@gmail.com
SMPT_PASSWORD=your-app-password
SMPT_HOST=smtp.gmail.com
SMPT_PORT=587
STRIPE_API_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 3. Port Configuration

- Container Port: 5001
- Host Port: 5001 (or as configured in Dokploy)

### 4. Volume Mounts (Optional)

- `./uploads:/app/uploads` - For file uploads persistence
- `./logs:/app/logs` - For application logs

### 5. Health Check

- Health check endpoint: `http://localhost:5001/api/v2/health`
- Interval: 30s
- Timeout: 10s
- Retries: 3

### 6. Database Setup

The application expects MongoDB to be available at the URI specified above. If you're using the docker-compose.yml file, it will set up MongoDB automatically.

### 7. Deployment Steps

1. Create a new application in Dokploy
2. Connect your Git repository
3. Set the build source to "Dockerfile"
4. Configure the environment variables listed above
5. Set the port to 5001
6. Deploy the application

### 8. Post-Deployment

- Verify the health check endpoint is responding
- Test the admin login functionality
- Check file upload functionality
- Monitor logs for any issues

### 9. Troubleshooting

- Check container logs if the application fails to start
- Verify MongoDB connectivity
- Ensure all environment variables are set correctly
- Check file permissions for uploads directory
