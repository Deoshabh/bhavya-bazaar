const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Shop = require("../model/shop");
const Admin = require("../model/admin");
const SessionManager = require("../utils/sessionManager");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const fs = require("fs");
const path = require("path");

// Import authLimiter with fallback
let authLimiter;
try {
  const rateLimiters = require("../middleware/rateLimiter");
  authLimiter = rateLimiters.authLimiter;
} catch (error) {
  console.error("Failed to load authLimiter in auth controller:", error.message);
  authLimiter = (req, res, next) => next();
}

// Helper function to clean up uploaded files
const cleanupFile = (filename) => {
  if (filename) {
    fs.unlink(`uploads/${filename}`, (err) => {
      if (err) console.log("Error deleting file:", err);
    });
  }
};

// ===================
// USER AUTHENTICATION
// ===================

// User Registration
router.post("/register-user", 
  authLimiter,
  upload.single("avatar"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("📝 User registration request received");
      const { name, email, password, phoneNumber } = req.body;
        if (!name || !phoneNumber || !password) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Please provide all required fields", 400));
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      // Validate email format if provided
      if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Please provide a valid email address", 400));
      }// Check for existing user
      const existingUser = await User.findOne({ 
        $or: [
          { phoneNumber },
          ...(email ? [{ email }] : [])
        ]
      });
      
      if (existingUser) {
        if (req.file) cleanupFile(req.file.filename);
        const field = existingUser.phoneNumber === phoneNumber ? "phone number" : "email";
        return next(new ErrorHandler(`User already exists with this ${field}`, 400));
      }

      // File validation if uploaded
      let avatarUrl = null;
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        
        if (!allowedTypes.includes(req.file.mimetype)) {
          cleanupFile(req.file.filename);
          return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
        }
        
        if (req.file.size > maxSize) {
          cleanupFile(req.file.filename);
          return next(new ErrorHandler("File too large. Maximum size is 5MB.", 400));
        }
        
        avatarUrl = req.file.filename;
      }

      const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        avatar: avatarUrl,
        role: 'user'
      });

      await SessionManager.createUserSession(req, user);
      
      console.log("✅ User registered successfully:", user.name, "ID:", user._id);

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar || null,
          role: 'user'
        },
        userType: 'user',
        message: "User registered successfully"
      });
    } catch (error) {
      if (req.file) cleanupFile(req.file.filename);
      console.error("❌ User registration error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// User Login (Enhanced - Updated to use phone number)
router.post("/login-user",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔐 User login request received");
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const user = await User.findOne({ phoneNumber }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorHandler("Invalid credentials", 401));
      }

      await SessionManager.createUserSession(req, user);
      
      console.log("✅ User login successful:", user.name, "ID:", user._id);

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar || null,
          role: 'user'
        },
        userType: 'user',
        message: "User login successful"
      });
    } catch (error) {
      console.error("❌ User login error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// =====================
// SELLER AUTHENTICATION (Enhanced from shop.js)
// =====================

// Seller Registration (Moved from shop.js)
router.post("/register-seller", 
  authLimiter,
  upload.single("avatar"), 
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("📝 Seller registration request received");
      const { name, phoneNumber, password, address, zipCode } = req.body;
      
      if (!name || !phoneNumber || !password || !address || !zipCode) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Please provide all required fields", 400));
      }

      // Validate phone number - enforce 10 digits
      if (!/^\d{10}$/.test(phoneNumber)) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      // Check for existing seller
      const existingSeller = await Shop.findOne({ phoneNumber });
      if (existingSeller) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Seller already exists with this phone number", 400));
      }

      // File validation (same as original shop.js)
      let fileUrl = null;
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        
        if (!allowedTypes.includes(req.file.mimetype)) {
          cleanupFile(req.file.filename);
          return next(new ErrorHandler("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400));
        }
        
        if (req.file.size > maxSize) {
          cleanupFile(req.file.filename);
          return next(new ErrorHandler("File too large. Maximum size is 5MB.", 400));
        }
        
        fileUrl = req.file.filename;
      }

      const seller = await Shop.create({
        name,
        phoneNumber,
        password,
        avatar: fileUrl,
        address,
        zipCode,
        role: 'seller'
      });

      await SessionManager.createShopSession(req, seller);
      
      console.log("✅ Seller registered successfully:", seller.name, "ID:", seller._id);
      
      res.status(201).json({
        success: true,
        seller: {
          id: seller._id,
          _id: seller._id,
          name: seller.name,
          phoneNumber: seller.phoneNumber,
          description: seller.description,
          avatar: seller.avatar || null,
          email: seller.email || null,
          address: seller.address || null,
          zipCode: seller.zipCode || null,
          role: 'seller'
        },
        userType: 'seller',
        message: "Seller registered successfully"
      });
    } catch (error) {
      if (req.file) cleanupFile(req.file.filename);
      console.error("❌ Seller registration error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Seller Login (Enhanced from shop.js)
router.post("/login-seller",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔐 Seller login request received");
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const shop = await Shop.findOne({ phoneNumber }).select("+password");

      if (!shop || !(await shop.comparePassword(password))) {
        return next(new ErrorHandler("Invalid credentials", 401));
      }

      await SessionManager.createShopSession(req, shop);
      
      console.log("✅ Seller login successful:", shop.name, "ID:", shop._id);
      
      res.status(200).json({
        success: true,
        seller: {
          id: shop._id,
          _id: shop._id,
          name: shop.name,
          phoneNumber: shop.phoneNumber,
          description: shop.description,
          avatar: shop.avatar || null,
          email: shop.email || null,
          address: shop.address || null,
          zipCode: shop.zipCode || null,
          role: 'seller'
        },
        userType: 'seller',
        message: "Seller login successful"
      });
    } catch (error) {
      console.error("❌ Seller login error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ====================
// ADMIN AUTHENTICATION
// ====================

// Admin Login (No registration - admins created manually)
router.post("/login-admin",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔐 Admin login request received");
      const { email, password, adminKey } = req.body;

      if (!email || !password || !adminKey) {
        return next(new ErrorHandler("Please provide email, password, and admin key", 400));
      }

      // Verify admin key
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        console.warn("❌ Invalid admin key attempt for email:", email);
        return next(new ErrorHandler("Invalid admin key", 401));
      }

      const admin = await Admin.findOne({ email }).select("+password");

      if (!admin) {
        return next(new ErrorHandler("Invalid admin credentials", 401));
      }

      // Check if account is locked
      if (admin.isLocked()) {
        return next(new ErrorHandler("Account is temporarily locked due to too many failed login attempts", 423));
      }

      const isPasswordValid = await admin.comparePassword(password);

      if (!isPasswordValid) {
        await admin.incLoginAttempts();
        return next(new ErrorHandler("Invalid admin credentials", 401));
      }

      // Reset login attempts on successful login
      await admin.resetLoginAttempts();

      await SessionManager.createAdminSession(req, admin);
      
      console.log("✅ Admin login successful:", admin.name, "ID:", admin._id);

      res.status(200).json({
        success: true,
        admin: {
          id: admin._id,
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || []
        },
        userType: 'admin',
        message: "Admin login successful"
      });
    } catch (error) {
      console.error("❌ Admin login error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ================
// UNIVERSAL LOGOUT
// ================

router.post("/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 Logout request received");
      await SessionManager.destroySession(req);
      
      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ====================
// SESSION STATUS CHECK
// ====================

router.get("/session-status",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sessionData = await SessionManager.getSessionData(req);
      
      if (!sessionData) {
        return res.status(200).json({
          success: true,
          authenticated: false,
          userType: null,
          user: null
        });
      }

      res.status(200).json({
        success: true,
        authenticated: true,
        userType: sessionData.userType,
        user: sessionData.user
      });
    } catch (error) {
      console.error("❌ Session status error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ===================
// GET CURRENT USER DATA
// ===================

router.get("/me",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sessionData = await SessionManager.getSessionData(req);
      
      if (!sessionData) {
        return next(new ErrorHandler("Not authenticated", 401));
      }

      let userData = null;
      
      if (sessionData.userType === 'user') {
        userData = await User.findById(sessionData.user.id);
      } else if (sessionData.userType === 'seller') {
        userData = await Shop.findById(sessionData.user.id);
      } else if (sessionData.userType === 'admin') {
        userData = await Admin.findById(sessionData.user.id);
      }

      if (!userData) {
        return next(new ErrorHandler("User not found", 404));
      }

      res.status(200).json({
        success: true,
        user: userData,
        userType: sessionData.userType,
        authenticated: true
      });
    } catch (error) {
      console.error("❌ Get current user error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
