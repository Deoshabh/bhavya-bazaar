# 🔑 Admin Account Setup Guide - Bhavya Bazaar

This guide will help you create an admin account and access the admin panel for your Bhavya Bazaar e-commerce application.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating Admin Account](#creating-admin-account)
3. [Accessing Admin Panel](#accessing-admin-panel)
4. [Admin Dashboard Features](#admin-dashboard-features)
5. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before creating an admin account, ensure:

1. **MongoDB is running** and the database is accessible
2. **Backend server is running** (for production) or can connect to the database
3. **Admin creation script is available** at `backend/scripts/createAdmin.js`

## 👤 Creating Admin Account

### Option 1: Using the Admin Creation Script (Recommended)

The application includes a dedicated script for creating admin accounts:

#### Basic Usage (with default credentials):
```bash
cd backend
node scripts/createAdmin.js
```

**Default credentials created:**
- Phone: `1234567890`
- Password: `admin123`
- Name: `Admin User`

#### Custom Admin Account:
```bash
cd backend
node scripts/createAdmin.js [PHONE_NUMBER] [PASSWORD] [NAME]
```

**Example:**
```bash
node scripts/createAdmin.js 9876543210 mySecurePassword123 "John Admin"
```

### Option 2: Manual Database Entry

If you need to manually create an admin user:

1. **Connect to your MongoDB database**
2. **Insert admin user document:**
```javascript
// In MongoDB shell or MongoDB Compass
db.users.insertOne({
  name: "Admin User",
  phoneNumber: "1234567890", // Must be unique
  password: "$2a$10$hashPasswordHere", // Use bcrypt to hash
  role: "Admin",
  avatar: "defaultAvatar.png",
  createdAt: new Date()
});
```

### ✅ Verification

After running the script, you should see:
```
✅ Admin user created successfully!
Phone: 1234567890
Name: Admin User
Password: admin123 (stored encrypted)
You can now log in to the admin dashboard with these credentials.
```

## 🌐 Accessing Admin Panel

### Step 1: Login with Admin Credentials

1. **Open your application** in the browser
2. **Navigate to the login page**: `https://yourdomain.com/login` or `http://localhost:3000/login`
3. **Use admin credentials:**
   - **Phone Number**: `1234567890` (or your custom phone)
   - **Password**: `admin123` (or your custom password)

### Step 2: Access Admin Dashboard

After successful login with admin credentials, you can access the admin panel at:

- **Main Admin Dashboard**: `/admin/dashboard`
- **Or use the sidebar navigation** once logged in

### 🎯 Admin Dashboard Features

The admin panel includes the following sections:

| Section | Route | Description |
|---------|-------|-------------|
| **Dashboard** | `/admin/dashboard` | Overview with stats and recent orders |
| **All Orders** | `/admin-orders` | Manage all platform orders |
| **All Sellers** | `/admin-sellers` | View and manage seller accounts |
| **All Users** | `/admin-users` | Manage user accounts |
| **All Products** | `/admin-products` | View and manage all products |
| **All Events** | `/admin-events` | Manage promotional events |
| **Withdraw Requests** | `/admin-withdraw-request` | Handle seller withdrawal requests |
| **Settings** | `/profile` | Admin profile settings |

### 🛡️ Admin Authentication

The application uses role-based authentication:
- **User role must be "Admin"** (exact case-sensitive match)
- **Protected by `ProtectedAdminRoute`** component
- **Automatically redirects non-admin users** to home page

## 🔧 Troubleshooting

### Issue 1: Admin Creation Script Fails

**Error: "MongoDB connection error"**
```bash
# Check if MongoDB is running
mongosh # or mongo

# Verify connection string in createAdmin.js
# Default: mongodb://127.0.0.1:27017/multi-vendor
```

**Solution:**
1. Ensure MongoDB is running on the correct port
2. Update the DB_URL in `createAdmin.js` if needed
3. Check firewall settings

### Issue 2: Cannot Access Admin Panel

**Error: Redirected to home page after login**

**Possible causes:**
1. **User role is not "Admin"** (case-sensitive)
2. **Authentication state not updated**

**Solution:**
```javascript
// Check user role in database
db.users.find({ phoneNumber: "1234567890" }, { role: 1 });

// Update role if needed
db.users.updateOne(
  { phoneNumber: "1234567890" },
  { $set: { role: "Admin" } }
);
```

### Issue 3: Admin Already Exists

**Message: "Admin user already exists"**

The script shows existing admin details:
```
Admin user already exists:
Phone: 1234567890
Name: Admin User
Please use this account to log in to the admin dashboard
```

**Solutions:**
1. **Use the existing admin account** with the displayed phone number
2. **Create a different admin** with a different phone number
3. **Reset password** of existing admin in database

### Issue 4: Database Connection Issues

**Error: Database connection failed**

**Check environment variables:**
```bash
# In backend/.env
MONGO_URI=mongodb://127.0.0.1:27017/multi-vendor
# or your production MongoDB URL
```

### Issue 5: Login Not Working

**Admin credentials not working:**

1. **Verify phone number format** (numbers only, no spaces/dashes)
2. **Check password** (case-sensitive)
3. **Clear browser cache** and cookies
4. **Check backend logs** for authentication errors

## 🚀 Production Deployment

For production environments:

1. **Update MongoDB connection** in `createAdmin.js`:
```javascript
const DB_URL = process.env.MONGO_URI || "your-production-mongodb-url";
```

2. **Run admin creation** on production server:
```bash
cd backend
node scripts/createAdmin.js 9876543210 SecurePassword123 "Production Admin"
```

3. **Secure admin credentials** and store safely

## 📝 Security Best Practices

1. **Use strong passwords** for admin accounts
2. **Use unique phone numbers** that aren't publicly known
3. **Regularly update admin passwords**
4. **Monitor admin login activity**
5. **Restrict admin panel access** by IP if possible

## 🎉 Success!

Once set up successfully, you'll have:
- ✅ Admin account created with proper role
- ✅ Access to full admin dashboard
- ✅ Ability to manage users, sellers, orders, and products
- ✅ Control over platform settings and withdrawals

Your admin panel will be accessible at `/admin/dashboard` after logging in with admin credentials.

---

**Need help?** Check the [DEPLOYMENT_FIX_GUIDE.md](./DEPLOYMENT_FIX_GUIDE.md) for additional troubleshooting steps.
