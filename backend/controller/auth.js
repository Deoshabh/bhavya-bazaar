const express = require("express");
const User = require("../model/user");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const SessionManager = require("../utils/sessionManager");

// Import authLimiter with fallback
let authLimiter;
try {
  const rateLimiters = require("../middleware/rateLimiter");
  authLimiter = rateLimiters.authLimiter;
} catch (error) {
  console.error("Failed to load authLimiter in auth controller:", error.message);
  // Create a pass-through middleware as fallback
  authLimiter = (req, res, next) => next();
}

const router = express.Router();

// Unified login endpoints - Session-based authentication
// User login endpoint
router.post(
  "/login/user",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }
      
      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const user = await User.findOne({ phoneNumber }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }
      
      // Create user session
      await SessionManager.createUserSession(req, user);
      
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          avatar: user.avatar || null
        },
        userType: 'user',
        message: "User login successful"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Shop login endpoint
router.post(
  "/login/shop",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const shop = await Shop.findOne({ phoneNumber }).select("+password");

      if (!shop) {
        return next(new ErrorHandler("Shop doesn't exist with this phone number", 400));
      }

      const isPasswordValid = await shop.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }

      // Create shop session
      await SessionManager.createShopSession(req, shop);
      
      res.status(201).json({
        success: true,
        seller: {
          id: shop._id,
          name: shop.name,
          phoneNumber: shop.phoneNumber,
          description: shop.description,
          avatar: shop.avatar || null
        },
        userType: 'shop',
        message: "Shop login successful"
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin login endpoint - uses user model but checks for Admin role
router.post(
  "/login/admin",
  authLimiter,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return next(new ErrorHandler("Please provide phone number and password", 400));
      }
      
      // Validate phone number format
      if (!/^\d{10}$/.test(phoneNumber)) {
        return next(new ErrorHandler("Please provide a valid 10-digit phone number", 400));
      }

      const user = await User.findOne({ phoneNumber }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      if (user.role !== "Admin") {
        return next(new ErrorHandler("Access denied. Admin privileges required.", 403));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(new ErrorHandler("Incorrect password", 400));
      }
      
      // Create admin session
      await SessionManager.createAdminSession(req, user);

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          avatar: user.avatar || null
        },
        userType: 'admin',
        message: "Admin login successful"
      });
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unified logout endpoints
// User logout
router.post(
  "/logout/user",
  catchAsyncErrors(async (req, res, next) => {    try {
      // Destroy user session using SessionManager
      const sessionDestroyed = await SessionManager.destroySession(req, res);
      
      if (!sessionDestroyed) {
        console.warn("Session could not be destroyed or was already invalid");
      }
      
      res.status(200).json({
        success: true,
        message: "User logout successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Shop logout
router.post(
  "/logout/shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Destroy shop session using SessionManager
      const sessionDestroyed = await SessionManager.destroySession(req, res);
      
      if (!sessionDestroyed) {
        console.warn("Session could not be destroyed or was already invalid");
      }
      
      res.status(200).json({
        success: true,
        message: "Shop logout successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin logout
router.post(
  "/logout/admin",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Destroy admin session using SessionManager
      const sessionDestroyed = await SessionManager.destroySession(req, res);
      
      if (!sessionDestroyed) {
        console.warn("Session could not be destroyed or was already invalid");
      }
      
      res.status(200).json({
        success: true,
        message: "Admin logout successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get current authenticated user endpoint
router.get(
  "/me",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Try to validate user session first
      const userSession = await SessionManager.validateUserSession(req);
      if (userSession) {
        return res.status(200).json({
          success: true,
          user: userSession,
          userType: 'user',
          message: "User session valid"
        });
      }
      
      // Try to validate shop session
      const shopSession = await SessionManager.validateShopSession(req);
      if (shopSession) {
        return res.status(200).json({
          success: true,
          seller: shopSession,
          userType: 'seller',
          message: "Shop session valid"
        });
      }
      
      // Try to validate admin session
      const adminSession = await SessionManager.validateAdminSession(req);
      if (adminSession) {
        return res.status(200).json({
          success: true,
          user: adminSession,
          userType: 'admin',
          message: "Admin session valid"
        });
      }
      
      // No valid session found
      return next(new ErrorHandler("Not authenticated", 401));
      
    } catch (error) {
      console.error("Session validation error:", error);
      return next(new ErrorHandler("Authentication check failed", 500));
    }
  })
);

// Session extension endpoint - extends active sessions
router.post(
  "/refresh",
  catchAsyncErrors(async (req, res, next) => {
    try {      // Try to extend user session
      const userSession = await SessionManager.validateUserSession(req);
      if (userSession) {
        await SessionManager.extendSession(req);
        return res.status(200).json({
          success: true,
          user: userSession,
          userType: 'user',
          message: "User session extended"
        });
      }
      
      // Try to extend shop session
      const shopSession = await SessionManager.validateShopSession(req);
      if (shopSession) {
        await SessionManager.extendSession(req);
        return res.status(200).json({
          success: true,
          seller: shopSession,
          userType: 'seller',
          message: "Shop session extended"
        });
      }
      
      // Try to extend admin session
      const adminSession = await SessionManager.validateAdminSession(req);
      if (adminSession) {
        await SessionManager.extendSession(req);
        return res.status(200).json({
          success: true,
          user: adminSession,
          userType: 'admin',
          message: "Admin session extended"
        });
      }
        // No valid sessions to extend
      return next(new ErrorHandler("No valid session found to refresh", 401));
      
    } catch (error) {
      console.error("Session extension error:", error);
      return next(new ErrorHandler("Session extension failed", 500));
    }
  })
);

module.exports = router;
