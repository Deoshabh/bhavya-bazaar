# Domain Redirection Fix Guide

## 🚨 Problem
`https://bhavyabazaar.com/` redirects to `http://www.bhavyasangh.com/`

## 🔍 Diagnosis Steps

### Step 1: Check DNS Records
```bash
# Check current DNS A records
nslookup bhavyabazaar.com
# Should point to your VPS IP address

# Check with different DNS tool
dig bhavyabazaar.com A
```

### Step 2: Check Domain in Coolify
1. Go to Coolify Dashboard
2. Check your frontend service
3. Look at **Domain** settings
4. Verify `bhavyabazaar.com` is listed correctly

### Step 3: Check Domain Registrar
1. Log into your domain registrar (where you bought bhavyabazaar.com)
2. Check for any **URL forwarding** or **redirects**
3. Look for **DNS management** settings

## 🛠️ Fix Options

### Option A: Fix DNS Records
**If DNS is wrong:**
1. Go to your domain registrar
2. Update A record to point to your VPS IP
3. Remove any CNAME records pointing to bhavyasangh.com

### Option B: Fix Coolify Domain
**If Coolify config is wrong:**
1. In Coolify, go to your frontend service
2. Click **Domains** tab
3. Ensure `bhavyabazaar.com` is properly configured
4. Check if SSL is working

### Option C: Remove Domain Redirect
**If there's a registrar redirect:**
1. Check your domain registrar control panel
2. Look for "URL Forwarding" or "Redirects"
3. Remove any redirects to bhavyasangh.com

## 🧪 Test Steps

### 1. Check Current IP
```bash
# What IP does your domain resolve to?
ping bhavyabazaar.com
```

### 2. Check Your VPS IP
```bash
# What's your VPS IP? (run on VPS)
curl ipinfo.io/ip
```

### 3. Direct IP Test
```bash
# Test your VPS directly (replace with your VPS IP)
curl http://YOUR_VPS_IP:3004/health
```

## 🎯 Expected Results

✅ **After Fix:**
- `bhavyabazaar.com` should resolve to your VPS IP
- `https://bhavyabazaar.com/` should show your React app
- `https://bhavyabazaar.com/health` should return JSON health status
- No redirect to bhavyasangh.com

## ⚠️ Common Issues

### Issue 1: DNS Propagation
- DNS changes can take 24-48 hours to propagate
- Use different DNS servers to test: 8.8.8.8, 1.1.1.1

### Issue 2: Multiple A Records
- Remove old A records pointing to wrong IPs
- Keep only one A record pointing to your VPS

### Issue 3: Cloudflare/CDN
- If using Cloudflare, check proxy settings
- Ensure SSL/TLS is properly configured

## 🚀 Quick Fix Commands

### Check DNS (Windows PowerShell):
```powershell
# Check what IP your domain points to
Resolve-DnsName bhavyabazaar.com -Type A

# Check if redirect is DNS-level
Invoke-WebRequest -Uri "https://bhavyabazaar.com/" -MaximumRedirection 0
```

### Check Your VPS:
```bash
# SSH to your VPS and check if Coolify is running
docker ps | grep coolify
```

This is a **domain configuration issue**, not a code issue. Your Node.js server setup is correct!
