# Bhavya Bazaar - Administrative Scripts

This directory contains useful administrative scripts for managing the Bhavya Bazaar e-commerce platform. All scripts are production-ready and include proper error handling, logging, and safety measures.

## 📋 Available Scripts

### 1. 🔑 Admin User Management
```bash
# Create admin user in production database
node scripts/createAdminUser.js [phoneNumber] [password] [name]

# Examples:
node scripts/createAdminUser.js 1234567890 admin123 "Super Admin"
node scripts/createAdminUser.js 9876543210 SecurePass123 "Admin User"
```

### 2. 🏥 Database Health Check
```bash
# Check database connectivity and health
node scripts/dbHealthCheck.js
```

### 3. 👥 User Management
```bash
# List all users
node scripts/userManagement.js list [limit]

# Search user by phone number
node scripts/userManagement.js search [phoneNumber]

# Promote user to admin
node scripts/userManagement.js promote [phoneNumber]

# Demote admin to user
node scripts/userManagement.js demote [phoneNumber]

# Show user statistics
node scripts/userManagement.js stats

# Examples:
node scripts/userManagement.js list 50
node scripts/userManagement.js search 1234567890
node scripts/userManagement.js promote 9876543210
```

### 4. 💾 Database Backup
```bash
# Create database backup
node scripts/dbBackup.js backup

# List available backups
node scripts/dbBackup.js list

# Clean old backups (older than N days)
node scripts/dbBackup.js cleanup [days]

# Examples:
node scripts/dbBackup.js backup
node scripts/dbBackup.js cleanup 30
```

### 5. 📊 System Monitoring
```bash
# Show system and database status
node scripts/systemMonitor.js status

# Show performance metrics
node scripts/systemMonitor.js performance

# Test API endpoints
node scripts/systemMonitor.js test-apis

# Show recent logs
node scripts/systemMonitor.js logs [lines]

# Examples:
node scripts/systemMonitor.js status
node scripts/systemMonitor.js logs 100
```

### 6. 📈 Data Analytics
```bash
# Business overview
node scripts/analytics.js overview

# Sales analytics
node scripts/analytics.js sales [days]

# User analytics
node scripts/analytics.js users [days]

# Product analytics
node scripts/analytics.js products

# Performance metrics
node scripts/analytics.js performance

# Examples:
node scripts/analytics.js overview
node scripts/analytics.js sales 7
node scripts/analytics.js users 30
```

## 🚀 Quick Start Guide

### First Time Setup
1. **Create Admin User:**
   ```bash
   node scripts/createAdminUser.js 1234567890 admin123 "Super Admin"
   ```

2. **Check System Health:**
   ```bash
   node scripts/dbHealthCheck.js
   node scripts/systemMonitor.js status
   ```

3. **Create Initial Backup:**
   ```bash
   node scripts/dbBackup.js backup
   ```

### Daily Operations
- **Monitor System:** `node scripts/systemMonitor.js status`
- **Check Analytics:** `node scripts/analytics.js overview`
- **User Management:** `node scripts/userManagement.js stats`

### Weekly Maintenance
- **Create Backup:** `node scripts/dbBackup.js backup`
- **Clean Old Backups:** `node scripts/dbBackup.js cleanup 30`
- **Health Check:** `node scripts/dbHealthCheck.js`

## 🔒 Security Notes

1. **Admin Credentials:** Always use strong passwords for admin accounts
2. **Environment Variables:** Ensure `.env` file contains proper database credentials
3. **Backup Storage:** Store backups in secure locations
4. **User Deletion:** The user deletion feature is disabled for safety - modify script if needed
5. **Database Restore:** Restore functionality is disabled - use MongoDB tools for production restores

## 🛠️ Prerequisites

- Node.js installed
- MongoDB connection configured in `.env`
- Required environment variables:
  - `DB_URI` - MongoDB connection string
  - `JWT_SECRET_KEY` - JWT secret for authentication
  - `NODE_ENV` - Environment (production/development)

## 📁 Environment Setup

Make sure your `.env` file contains:
```env
DB_URI=mongodb://your-database-connection-string
JWT_SECRET_KEY=your-jwt-secret-key
NODE_ENV=production
PORT=8000
```

## 🔍 Troubleshooting

### Database Connection Issues
- Check MongoDB server status
- Verify DB_URI in environment variables
- Ensure network connectivity to database

### Permission Issues
- Ensure scripts have execute permissions: `chmod +x scripts/*.js`
- Run with proper Node.js version

### Script Errors
- Check log output for detailed error messages
- Verify all required dependencies are installed: `npm install`

## 📞 Support

For issues with these scripts:
1. Check the script output for detailed error messages
2. Verify environment configuration
3. Ensure database connectivity
4. Check Node.js version compatibility

## 🔄 Script Updates

These scripts are designed to be:
- **Production-ready** with proper error handling
- **Safe** with confirmation prompts for destructive operations
- **Informative** with detailed logging and status messages
- **Flexible** with command-line parameters and options

Keep scripts updated and test in development environment before production use.
