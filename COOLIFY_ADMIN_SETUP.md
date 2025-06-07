# 🔑 Admin Account Setup Guide for Coolify Deployment

## 📋 Quick Setup (Production Ready)

### Option 1: Using the Production Script (Recommended)

**In your Coolify backend terminal, run:**

```bash
# Create admin with default credentials
node scripts/createAdmin.production.js

# OR create admin with custom credentials
node scripts/createAdmin.production.js "7900601901" "DevSum@123" "DevSum Admin"
```

**Default Admin Credentials:**
- 📱 **Phone:** `7900601901`
- 🔑 **Password:** `DevSum@123`
- 👤 **Name:** `DevSum Admin`

### Option 2: Using Environment Variables

**Update your original script to use environment variables:**

```bash
# In Coolify backend terminal
node scripts/createAdmin.js "7900601901" "DevSum@123" "DevSum Admin"
```

---

## 🌐 Accessing the Admin Dashboard

### 1. **Login Process**
1. Go to: `https://bhavyabazaar.com/login`
2. Enter your admin phone number and password
3. Click "Login"
4. You'll be automatically redirected to the admin dashboard

### 2. **Direct Admin Dashboard URL**
- `https://bhavyabazaar.com/admin/dashboard`
- ⚠️ **Note:** You must be logged in as an admin to access this URL

### 3. **Admin Panel Features**
- 📊 **Dashboard Overview:** `/admin/dashboard`
- 👥 **User Management:** `/admin-users`
- 🏪 **Seller Management:** `/admin-sellers`
- 📦 **Order Management:** `/admin-orders`
- 🛍️ **Product Management:** `/admin-products`
- 🎉 **Event Management:** `/admin-events`
- 💰 **Withdraw Requests:** `/admin-withdraw-request`

---

## 🔧 Database Configuration

### Production Database Details
```
Database: bhavya-bazar
Host: hk0w48gckcgcwggkgwg04wgo:27017
Username: root
Authentication: admin
```

### Environment Variables Required
```env
DB_URI=mongodb://root:jmU9RAj8gDoz794KNPk1f7GkIKjX0bnqLZ1DSnylnnsTjuJG5CStX1IuTD4ZA9BO@hk0w48gckcgcwggkgwg04wgo:27017/bhavya-bazar?authSource=admin
JWT_SECRET_KEY=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
JWT_EXPIRES=7d
ACTIVATION_SECRET=c4d6c1e15acc2b4461c15b1f7fc6e58f83e03dd48ff5b5ac41fbf3afd10a3113
```

---

## 🛠️ Troubleshooting

### Issue: "MongoDB connection error"
**Solution:**
1. Check that your `DB_URI` environment variable is set correctly in Coolify
2. Ensure the MongoDB service is running
3. Verify the connection string includes `?authSource=admin`

### Issue: "Admin already exists"
**Solution:**
- The script will show you the existing admin credentials
- Use those credentials to log in
- If you need a new admin, use a different phone number

### Issue: "Cannot access admin dashboard"
**Solution:**
1. Make sure you're logged in with an admin account
2. Check that the user role is set to "Admin" (capital A)
3. Clear browser cache and cookies
4. Try logging out and logging back in

### Issue: "User already exists with this phone number"
**Solution:**
- Use a different phone number
- Or the script will upgrade the existing user to admin role

---

## 📱 Testing Admin Access

### 1. **Test Login**
```bash
# Test with curl (replace with your domain)
curl -X POST https://api.bhavyabazaar.com/api/v2/user/login-user \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9999999999",
    "password": "admin123456"
  }'
```

### 2. **Verify Admin Role**
After login, check that the response includes:
```json
{
  "success": true,
  "user": {
    "role": "Admin",
    "name": "Super Admin",
    "phoneNumber": "9999999999"
  }
}
```

---

## 🔐 Security Best Practices

### 1. **Change Default Password**
- Always change the default admin password after first login
- Use a strong password with at least 12 characters

### 2. **Use Unique Phone Numbers**
- Don't use common phone numbers like "1234567890"
- Use a real phone number you control

### 3. **Monitor Admin Access**
- Regularly check admin login logs
- Remove unused admin accounts

---

## 📝 Script Examples

### Create Multiple Admins
```bash
# Create main admin
node scripts/createAdmin.production.js "9876543210" "SecurePass123" "Main Admin"

# Create secondary admin
node scripts/createAdmin.production.js "9876543211" "SecurePass456" "Secondary Admin"
```

### Check Existing Admins
```bash
# The script will automatically show existing admins when you run it
node scripts/createAdmin.production.js
```

---

## ✅ Success Confirmation

After successfully creating an admin account, you should see:
```
✅ Admin user created successfully!
🎉 Admin Setup Complete!
📱 Login Phone: 7900601901
🔑 Login Password: DevSum@123
🌐 Admin Dashboard: https://bhavyabazaar.com/admin/dashboard
```

Now you can access your admin panel at `https://bhavyabazaar.com/admin/dashboard` using these credentials!
