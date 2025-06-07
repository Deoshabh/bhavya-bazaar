## 🚀 Bhavya Bazaar - Quick Command Reference

### 📱 **ADMIN SETUP**

```bash
# Create admin account in Coolify terminal
node scripts/createAdmin.production.js

# Create with custom credentials
node scripts/createAdmin.production.js "phone" "password" "name"
```

**Default Admin Login:**
- Phone: `7900601901`
- Password: `DevSum@123`
- Dashboard: `https://bhavyabazaar.com/admin/dashboard`

---

### 🔧 **BACKEND COMMANDS**

```bash
# Start backend server
npm start

# Development mode
npm run dev

# Test Redis connection
npm run redis:test

# Seed sample data
npm run seed

# Cache management
npm run cache:warm
npm run cache:clear
```

---

### 🌐 **FRONTEND COMMANDS**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Test production build
npm run serve
```

---

### 🐳 **DOCKER & DEPLOYMENT**

```bash
# Build Docker image
docker build -t bhavya-bazaar .

# Run with Docker Compose
docker-compose -f docker-compose.coolify.yml up

# View logs
docker-compose logs -f
```

---

### 📊 **HEALTH CHECKS**

```bash
# API Health
curl https://api.bhavyabazaar.com/api/v2/health

# Cache Statistics
curl https://api.bhavyabazaar.com/api/v2/cache/stats

# Redis Status
curl https://api.bhavyabazaar.com/api/v2/cache/health
```

---

### 🔍 **TESTING & VALIDATION**

```bash
# Test authentication
node scripts/test-authentication.js

# Test API endpoints
node scripts/test-api-endpoints.js

# Performance test
node scripts/quick-performance-test.js

# Full validation
node scripts/final-validation.js
```

---

### 📁 **KEY FILES**

- **Environment**: `coolify-backend-env.txt`
- **Docker**: `docker-compose.coolify.yml`
- **Admin Setup**: `COOLIFY_ADMIN_SETUP.md`
- **Deployment**: `DEPLOYMENT_FIX_GUIDE.md`
- **Redis Config**: `backend/config/redis.js`

---

### 🎯 **ADMIN PANEL URLS**

- Login: `https://bhavyabazaar.com/login`
- Dashboard: `https://bhavyabazaar.com/admin/dashboard`
- Users: `https://bhavyabazaar.com/admin-users`
- Sellers: `https://bhavyabazaar.com/admin-sellers`
- Orders: `https://bhavyabazaar.com/admin-orders`
- Products: `https://bhavyabazaar.com/admin-products`
- Events: `https://bhavyabazaar.com/admin-events`
- Withdrawals: `https://bhavyabazaar.com/admin-withdraw-request`

---

### ⚡ **QUICK START**

1. **Deploy**: Use Coolify with `coolify-backend-env.txt`
2. **Admin**: Run `node scripts/createAdmin.production.js`
3. **Login**: Go to `https://bhavyabazaar.com/login`
4. **Manage**: Access admin dashboard

---

*Keep this reference handy for quick deployment and management tasks!*
