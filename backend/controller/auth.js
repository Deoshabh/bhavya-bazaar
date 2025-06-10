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

// Conditional upload middleware - only process if multipart/form-data
const conditionalUpload = (req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single("avatar")(req, res, next);
  }
  next();
};

// ===================
// USER AUTHENTICATION
// ===================

// User Registration
router.post("/register-user", 
  authLimiter,
  conditionalUpload,
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
      }      // Check for existing user
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

      // Check if seller already exists with this phone number
      const existingSeller = await Shop.findOne({ phoneNumber });
      if (existingSeller) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("A seller account already exists with this phone number. Please use a different number or contact support.", 400));
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
  conditionalUpload,
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
      }      // Check for existing seller
      const existingSeller = await Shop.findOne({ phoneNumber });
      if (existingSeller) {
        if (req.file) cleanupFile(req.file.filename);
        return next(new ErrorHandler("Seller already exists with this phone number", 400));
      }      // File validation first (before creating user accounts)
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

      // Check if user already exists with this phone number
      const existingUser = await User.findOne({ phoneNumber });
      
      // DUAL ROLE SYSTEM: If user exists, check if they want to become a seller
      let customerUser = existingUser;
      
      if (existingUser) {
        // User exists - they want to add seller role to their existing customer account
        console.log("👤 Existing customer wants to become seller:", existingUser.name);
      } else {
        // Create new customer account first (sellers are also customers)
        console.log("👤 Creating customer account for new seller...");
        customerUser = await User.create({
          name,
          phoneNumber,
          password,
          avatar: avatarUrl,
          role: 'user'
        });
        console.log("✅ Customer account created:", customerUser.name, "ID:", customerUser._id);
      }

      // Create seller account (linked to customer account)
      const seller = await Shop.create({
        name,
        phoneNumber,
        password,
        avatar: avatarUrl,
        address,
        zipCode,
        role: 'seller',
        customerId: customerUser._id // Link seller to customer account
      });

      await SessionManager.createShopSession(req, seller);
      
      console.log("✅ Seller registered successfully:", seller.name, "ID:", seller._id);
      console.log("🔗 Linked to customer account:", customerUser._id);
      
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
          role: 'seller',
          customerId: customerUser._id
        },
        customer: {
          id: customerUser._id,
          name: customerUser.name,
          phoneNumber: customerUser.phoneNumber,
          role: 'user'
        },
        userType: 'seller',
        message: "Seller registered successfully with dual role access"
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

// Admin Login (Enhanced to handle both admin and superadmin)
router.post("/login-admin",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔐 Admin login request received");
      const { email, password, adminSecretKey } = req.body;

      if (!email || !password || !adminSecretKey) {
        return next(new ErrorHandler("Please provide email, password, and admin secret key", 400));
      }

      // Verify admin secret key
      if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        console.warn("❌ Invalid admin secret key attempt for email:", email);
        return next(new ErrorHandler("Invalid admin secret key", 401));
      }

      const admin = await Admin.findOne({ email }).select("+password");

      if (!admin) {
        return next(new ErrorHandler("Invalid admin credentials", 401));
      }

      // Check if account is active
      if (!admin.isActive) {
        return next(new ErrorHandler("Admin account is deactivated", 401));
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

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      await SessionManager.createAdminSession(req, admin);
      
      console.log(`✅ ${admin.role} login successful:`, admin.name, "ID:", admin._id);

      res.status(200).json({
        success: true,
        admin: {
          id: admin._id,
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
          avatar: admin.avatar
        },
        userType: 'admin',
        message: `${admin.role} login successful`
      });
    } catch (error) {
      console.error("❌ Admin login error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Super Admin Creation (Only accessible by existing super admin)
router.post("/create-super-admin",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("👑 Super admin creation request received");
      const { name, email, password, superAdminKey } = req.body;

      if (!name || !email || !password || !superAdminKey) {
        return next(new ErrorHandler("Please provide all required fields", 400));
      }

      // Verify super admin key (different from regular admin key)
      if (superAdminKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
        console.warn("❌ Invalid super admin key attempt");
        return next(new ErrorHandler("Invalid super admin secret key", 401));
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return next(new ErrorHandler("Admin with this email already exists", 400));
      }

      const superAdmin = await Admin.create({
        name,
        email,
        password,
        role: 'superadmin',
        permissions: [
          'manage_users',
          'manage_sellers',
          'manage_products', 
          'manage_orders',
          'manage_system',
          'view_analytics',
          'manage_admins',
          'create_admins',
          'delete_admins',
          'system_config'
        ],
        isActive: true
      });

      console.log("✅ Super admin created successfully:", superAdmin.name);

      res.status(201).json({
        success: true,
        message: "Super admin created successfully",
        admin: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role,
          permissions: superAdmin.permissions
        }
      });
    } catch (error) {
      console.error("❌ Super admin creation error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Regular Admin Creation (Only by super admin)
router.post("/create-admin",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🛡️ Admin creation request received");
      const { name, email, password, permissions, adminSecretKey } = req.body;

      if (!name || !email || !password || !adminSecretKey) {
        return next(new ErrorHandler("Please provide all required fields", 400));
      }

      // Verify admin secret key
      if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return next(new ErrorHandler("Invalid admin secret key", 401));
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return next(new ErrorHandler("Admin with this email already exists", 400));
      }

      const admin = await Admin.create({
        name,
        email,
        password,
        role: 'admin',
        permissions: permissions || [
          'manage_users',
          'manage_sellers',
          'manage_products',
          'manage_orders',
          'view_analytics'
        ],
        isActive: true
      });

      console.log("✅ Regular admin created successfully:", admin.name);

      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      });
    } catch (error) {
      console.error("❌ Admin creation error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ================
// LOGOUT ENDPOINTS
// ================

// Universal logout endpoint
router.post("/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 Universal logout request received");
      await SessionManager.destroySession(req, res);
      
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

// User-specific logout endpoint
router.post("/logout/user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 User logout request received");
      
      // Validate that this is actually a user session
      const sessionData = SessionManager.getSessionData(req);
      if (sessionData && sessionData.userType !== 'user' && sessionData.userType !== 'admin') {
        return next(new ErrorHandler("Invalid session type for user logout", 400));
      }
      
      await SessionManager.destroySession(req, res);
      
      res.status(200).json({
        success: true,
        message: "User logout successful"
      });
    } catch (error) {
      console.error("❌ User logout error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Seller-specific logout endpoint
router.post("/logout/seller",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 Seller logout request received");
      
      // Validate that this is actually a seller session
      const sessionData = SessionManager.getSessionData(req);
      if (sessionData && sessionData.userType !== 'seller') {
        return next(new ErrorHandler("Invalid session type for seller logout", 400));
      }
      
      await SessionManager.destroySession(req, res);
      
      res.status(200).json({
        success: true,
        message: "Seller logout successful"
      });
    } catch (error) {
      console.error("❌ Seller logout error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Legacy endpoint for shop logout (redirect to seller logout)
router.post("/logout/shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 Shop logout request received (redirecting to seller logout)");
      
      // Validate that this is actually a seller session
      const sessionData = SessionManager.getSessionData(req);
      if (sessionData && sessionData.userType !== 'seller') {
        return next(new ErrorHandler("Invalid session type for shop logout", 400));
      }
      
      await SessionManager.destroySession(req, res);
      
      res.status(200).json({
        success: true,
        message: "Shop logout successful"
      });
    } catch (error) {
      console.error("❌ Shop logout error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin-specific logout endpoint
router.post("/logout/admin",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚪 Admin logout request received");
      
      // Validate that this is actually an admin session
      const sessionData = SessionManager.getSessionData(req);
      if (sessionData && sessionData.userType !== 'admin') {
        return next(new ErrorHandler("Invalid session type for admin logout", 400));
      }
      
      await SessionManager.destroySession(req, res);
      
      res.status(200).json({
        success: true,
        message: "Admin logout successful"
      });
    } catch (error) {
      console.error("❌ Admin logout error:", error.message);
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
      }      res.status(200).json({
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

// ====================
// DUAL ROLE SYSTEM
// ====================

// Switch between customer and seller roles (for sellers who are also customers)
router.post("/switch-role",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔄 Role switching request received");
      const { targetRole } = req.body;
      
      if (!['user', 'seller'].includes(targetRole)) {
        return next(new ErrorHandler("Invalid target role. Use 'user' or 'seller'", 400));
      }

      const currentSession = SessionManager.getSessionData(req);
      if (!currentSession || !currentSession.isAuthenticated) {
        return next(new ErrorHandler("Please login first", 401));
      }

      const phoneNumber = currentSession.user?.phoneNumber;
      if (!phoneNumber) {
        return next(new ErrorHandler("Invalid session data", 400));
      }

      if (targetRole === 'seller') {
        // Switch to seller mode - check if user has seller account
        const seller = await Shop.findOne({ phoneNumber });
        if (!seller) {
          return next(new ErrorHandler("You don't have a seller account. Please register as a seller first.", 400));
        }

        // Create seller session
        await SessionManager.createShopSession(req, seller);
        
        console.log("✅ Switched to seller mode:", seller.name);
        
        res.status(200).json({
          success: true,
          userType: 'seller',
          seller: {
            id: seller._id,
            name: seller.name,
            phoneNumber: seller.phoneNumber,
            role: 'seller'
          },
          message: "Switched to seller mode"
        });
        
      } else if (targetRole === 'user') {
        // Switch to customer mode - check if user has customer account
        const user = await User.findOne({ phoneNumber });
        if (!user) {
          return next(new ErrorHandler("Customer account not found", 400));
        }

        // Create user session
        await SessionManager.createUserSession(req, user);
        
        console.log("✅ Switched to customer mode:", user.name);
        
        res.status(200).json({
          success: true,
          userType: 'user',
          user: {
            id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: 'user'
          },
          message: "Switched to customer mode"
        });
      }
      
    } catch (error) {
      console.error("❌ Role switching error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Check available roles for current user
router.get("/available-roles",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("📋 Available roles check request received");
      
      const currentSession = SessionManager.getSessionData(req);
      if (!currentSession || !currentSession.isAuthenticated) {
        return next(new ErrorHandler("Please login first", 401));
      }

      const phoneNumber = currentSession.user?.phoneNumber;
      if (!phoneNumber) {
        return next(new ErrorHandler("Invalid session data", 400));
      }

      const availableRoles = [];
      
      // Check for customer account
      const user = await User.findOne({ phoneNumber });
      if (user) {
        availableRoles.push({
          role: 'user',
          name: 'Customer',
          accountId: user._id,
          current: currentSession.userType === 'user'
        });
      }

      // Check for seller account
      const seller = await Shop.findOne({ phoneNumber });
      if (seller) {
        availableRoles.push({
          role: 'seller',
          name: 'Seller',
          accountId: seller._id,
          current: currentSession.userType === 'seller'
        });
      }

      res.status(200).json({
        success: true,
        availableRoles,
        currentRole: currentSession.userType,
        canSwitch: availableRoles.length > 1
      });
      
    } catch (error) {
      console.error("❌ Available roles check error:", error.message);
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

      console.log("🔍 Session data for /me endpoint:", {
        userType: sessionData.userType,
        user: sessionData.user ? { id: sessionData.user.id, name: sessionData.user.name } : null
      });

      let userData = null;
      const userId = sessionData.user?.id;
      
      if (!userId) {
        console.error("❌ No user ID found in session data");
        return next(new ErrorHandler("Invalid session data", 401));
      }
        if (sessionData.userType === 'user') {
        userData = await User.findById(userId);
      } else if (sessionData.userType === 'seller') {
        userData = await Shop.findById(userId);
        
        // If seller is in customer mode, modify the response
        if (SessionManager.isSellerInCustomerMode(req)) {
          userData = {
            ...userData.toObject(),
            role: 'seller_as_customer',
            originalRole: 'seller',
            shopId: userData._id,
            isDualRole: true
          };
        }
      } else if (sessionData.userType === 'admin') {
        userData = await Admin.findById(userId);
      }

      if (!userData) {
        console.error("❌ User data not found in database for ID:", userId);
        return next(new ErrorHandler("User not found", 404));
      }

      console.log("✅ Successfully retrieved user data:", userData.name);

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

// ============================
// DUAL-ROLE FUNCTIONALITY
// ============================

// Enable customer mode for sellers (allows sellers to shop as customers)
router.post("/seller/enable-customer-mode",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔄 Enabling customer mode for seller");
      
      const sessionData = SessionManager.getSessionData(req);
      
      if (!sessionData || sessionData.userType !== 'seller') {
        return next(new ErrorHandler("Only sellers can enable customer mode", 401));
      }

      const result = SessionManager.enableSellerCustomerMode(req);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Customer mode enabled successfully",
          activeRole: 'customer',
          userType: 'seller',
          customerModeEnabled: true
        });
      } else {
        return next(new ErrorHandler(result.message, 400));
      }
    } catch (error) {
      console.error("❌ Enable customer mode error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Disable customer mode for sellers (back to seller-only mode)
router.post("/seller/disable-customer-mode",
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🔄 Disabling customer mode for seller");
      
      const sessionData = SessionManager.getSessionData(req);
      
      if (!sessionData || sessionData.userType !== 'seller') {
        return next(new ErrorHandler("Only sellers can disable customer mode", 401));
      }

      const result = SessionManager.disableSellerCustomerMode(req);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Customer mode disabled successfully",
          activeRole: 'seller',
          userType: 'seller',
          customerModeEnabled: false
        });
      } else {
        return next(new ErrorHandler(result.message, 400));
      }
    } catch (error) {
      console.error("❌ Disable customer mode error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get current active role and session info
router.get("/current-role",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sessionData = SessionManager.getSessionData(req);
        if (!sessionData || !sessionData.isAuthenticated) {
        return next(new ErrorHandler("No authenticated session found", 401));
      }

      const activeRole = SessionManager.getCurrentActiveRole(req);
      const isSellerInCustomerMode = SessionManager.isSellerInCustomerMode(req);

      res.status(200).json({
        success: true,
        userType: sessionData.userType,
        activeRole: activeRole,
        customerModeEnabled: isSellerInCustomerMode,
        canSwitchToCustomer: sessionData.userType === 'seller',
        sessionValid: true
      });
    } catch (error) {
      console.error("❌ Get current role error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==============================
// ADMIN MANAGEMENT ENDPOINTS
// ==============================

// Admin limits configuration
const ADMIN_LIMITS = {
  maxAdmins: 3,
  maxSuperAdmins: 1
};

// Reset admin system (DANGER - Only for initial setup)
router.post("/admin/reset-system", 
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("🚨 Admin system reset request received");
      const { confirmationKey } = req.body;

      // Super secure confirmation key for system reset
      if (confirmationKey !== "RESET_ADMIN_SYSTEM_BHAVYA_2024") {
        return next(new ErrorHandler("Invalid confirmation key", 401));
      }

      // Delete ALL existing admin accounts
      const deleteResult = await Admin.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin accounts`);

      // Create new Super Admin account
      const superAdmin = await Admin.create({
        name: "Super Administrator",
        email: "superadmin@bhavyabazaar.com",
        password: "SuperAdmin@2024!",
        role: "superadmin",
        permissions: [
          "manage_users",
          "manage_sellers",
          "manage_products", 
          "manage_orders",
          "manage_system",
          "view_analytics",
          "manage_admins",
          "manage_super_settings"
        ],
        isActive: true,
        createdBy: "system"
      });

      console.log("✅ Admin system reset completed");

      res.status(200).json({
        success: true,
        message: "Admin system reset successfully",
        adminCount: 0,
        superAdminCount: 1,
        limits: ADMIN_LIMITS,
        superAdmin: {
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role
        }
      });

    } catch (error) {
      console.error("❌ Admin system reset error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get admin system status
router.get("/admin/system-status",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const adminCount = await Admin.countDocuments({ role: 'admin' });
      const superAdminCount = await Admin.countDocuments({ role: 'superadmin' });
      const totalAdmins = adminCount + superAdminCount;

      const admins = await Admin.find({}, {
        name: 1,
        email: 1,
        role: 1,
        isActive: 1,
        createdAt: 1,
        lastLogin: 1
      }).sort({ role: -1, createdAt: 1 });

      res.status(200).json({
        success: true,
        adminCount,
        superAdminCount,
        totalAdmins,
        limits: ADMIN_LIMITS,
        canCreateAdmin: adminCount < ADMIN_LIMITS.maxAdmins,
        canCreateSuperAdmin: superAdminCount < ADMIN_LIMITS.maxSuperAdmins,
        admins: admins
      });

    } catch (error) {
      console.error("❌ Admin system status error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Check if current user is admin/super admin (for frontend visibility)
router.get("/admin/check-access",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sessionData = SessionManager.getSessionData(req);
      
      if (!sessionData || !sessionData.isAuthenticated) {
        return res.status(200).json({
          success: true,
          isAdmin: false,
          isSuperAdmin: false,
          canAccessAdmin: false
        });
      }

      const isAdmin = sessionData.userType === 'admin';
      const isAnyAdmin = isAdmin;

      if (isAdmin) {
        // Get admin details from database
        const admin = await Admin.findById(sessionData.user.id);
        const isSuperAdmin = admin?.role === 'superadmin';

        return res.status(200).json({
          success: true,
          isAdmin: true,
          isSuperAdmin,
          canAccessAdmin: true,
          adminRole: admin?.role,
          permissions: admin?.permissions || []
        });
      }

      res.status(200).json({
        success: true,
        isAdmin: false,
        isSuperAdmin: false,
        canAccessAdmin: false
      });

    } catch (error) {
      console.error("❌ Admin access check error:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
