# Bhavya Bazaar - Dokploy Deployment

This repository contains a full-stack e-commerce application (Bhavya Bazaar) configured for deployment on a VPS using Dokploy.

## 🏗️ Architecture

- **Frontend**: React.js application (served by backend)
- **Backend**: Node.js/Express API
- **Database**: MongoDB (external)
- **Port**: 8000
- **Deployment**: Single Docker container with Dokploy

## 🚀 Quick Deployment

### Prerequisites

1. VPS with Dokploy installed
2. Docker and Docker Compose (if testing locally)
3. MongoDB instance (or use included docker-compose.yml)

### Environment Configuration

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual configuration:
   ```env
   MONGODB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_bazaar?authSource=admin
   JWT_SECRET=your-super-secret-jwt-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   # ... see .env.example for all options
   ```

### Local Testing (Optional)

#### Using Docker Compose

```bash
docker-compose up -d
```

#### Using Build Script

```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows PowerShell
.\deploy.ps1
```

### Dokploy Deployment

1. **Create New Application** in Dokploy dashboard
2. **Connect Repository** to your Git repository
3. **Configure Build Settings**:

   - Build Type: `Dockerfile`
   - Dockerfile Path: `./Dockerfile`
   - Port: `5001`

4. **Set Environment Variables** (see `.env.example`)
5. **Deploy** the application

## 📋 Environment Variables

| Variable            | Description               | Required |
| ------------------- | ------------------------- | -------- |
| `NODE_ENV`          | Environment mode          | Yes      |
| `PORT`              | Application port          | Yes      |
| `MONGODB_URI`       | MongoDB connection string | Yes      |
| `JWT_SECRET`        | JWT signing secret        | Yes      |
| `STRIPE_SECRET_KEY` | Stripe payment secret     | Yes      |
| `SMPT_*`            | Email configuration       | Yes      |

See `.env.example` for complete list.

## 🔍 Health Check

The application includes a health check endpoint:

- **URL**: `http://your-domain:8000/api/v2/health`
- **Method**: GET
- **Expected Response**: 200 OK

## 📁 File Structure

```
├── Dockerfile                 # Multi-stage build for production
├── docker-compose.yml         # Local development setup
├── .dockerignore             # Docker build optimization
├── .env.example              # Environment template
├── deploy.sh                 # Linux/Mac deployment script
├── deploy.ps1                # Windows deployment script
├── DOKPLOY_DEPLOYMENT.md     # Detailed deployment guide
├── backend/                  # Node.js API
├── frontend/                 # React application
└── memory-bank/             # Development docs
```

## 🛠️ Troubleshooting

### Container Won't Start

1. Check environment variables are set correctly
2. Verify MongoDB connection string
3. Check container logs in Dokploy

### Database Connection Issues

1. Ensure MongoDB is accessible from container
2. Verify credentials and database name
3. Check network connectivity

### File Upload Issues

1. Ensure uploads directory exists
2. Check file permissions
3. Verify volume mounts (if using)

### Performance Issues

1. Monitor container resources
2. Check MongoDB performance
3. Review application logs

## 📚 Additional Resources

- [DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md) - Detailed deployment instructions
- [Backend Documentation](./backend/README.md) - API documentation
- [Frontend Documentation](./frontend/README.md) - React app details

## 🔒 Security Considerations

- Use strong passwords for MongoDB
- Keep JWT secrets secure
- Enable HTTPS in production
- Regular security updates
- Monitor application logs

## 📞 Support

For deployment issues or questions, check the troubleshooting section above or review the detailed deployment guide.
