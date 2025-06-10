# 🚀 Coolify Admin Script - Quick Guide

Run this script directly in your **Coolify backend terminal** to manage authentication and seller issues.

## 📋 Quick Commands

### 🏥 System Health Check
```bash
node coolify-admin.js system
```

### 🧪 Test Authentication
```bash
node coolify-admin.js test
```

### 📱 Check Phone Number
```bash
node coolify-admin.js check 9876543210
```

### 🔍 Diagnose Seller Issue
```bash
node coolify-admin.js diagnose 9876543210
```

### 🧹 Fix Seller Issue
```bash
# Safe cleanup (won't delete data)
node coolify-admin.js cleanup 9876543210

# Force cleanup (deletes everything - USE WITH CAUTION!)
node coolify-admin.js cleanup 9876543210 --force
```

### 📋 List All Sellers
```bash
# List last 20 sellers
node coolify-admin.js list

# List last 50 sellers
node coolify-admin.js list 50
```

## 🚨 Common Issues & Solutions

### ❌ "Phone number already exists"
```bash
node coolify-admin.js diagnose 9876543210
node coolify-admin.js cleanup 9876543210
```

### ❌ Authentication not working
```bash
node coolify-admin.js test
```

### ❌ General system issues
```bash
node coolify-admin.js system
```

## 🎯 How to Run on Coolify

1. **Access Coolify Dashboard**
2. **Go to your Backend Service**
3. **Click "Terminal" or "Exec"**
4. **Run any command above**

The script automatically handles database connections and provides colored output for easy reading.

## ⚡ Quick Fix Commands

```bash
# Complete system check
npm run admin:system

# Test authentication
npm run admin:test

# Show help
npm run admin
```

All commands are **production-safe** and include proper error handling!
