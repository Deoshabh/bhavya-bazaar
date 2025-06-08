const express = require("express");
const User = require("../model/user");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendShopToken = require("../utils/shopToken");
const { blacklistToken } = require("../middleware/tokenBlacklist");
const jwt = require("jsonwebtoken");

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

// Unified login endpoints
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
      
      // Send token with user_token cookie name for clarity
      sendToken(user, 201, res);
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

      // Send token with shop_token cookie name for clarity
      sendShopToken(shop, 201, res);
      
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
      
      // Send token with admin_token cookie name for clarity
      res.cookie("admin_token", user.getJwtToken(), {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.status(201).json({
        success: true,
        user,
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
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token } = req.cookies;
      
      // Blacklist the user token if it exists
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
          await blacklistToken(token, Math.max(remainingTime, 3600)); // At least 1 hour
        } catch (jwtError) {
          // If token is invalid/expired, still blacklist it for 1 hour as safety measure
          await blacklistToken(token, 3600);
        }
      }

      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      
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
      const { seller_token } = req.cookies;
      
      // Blacklist the seller token if it exists
      if (seller_token) {
        try {
          const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
          const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
          await blacklistToken(seller_token, Math.max(remainingTime, 3600)); // At least 1 hour
        } catch (jwtError) {
          // If token is invalid/expired, still blacklist it for 1 hour as safety measure
          await blacklistToken(seller_token, 3600);
        }
      }

      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      
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
      const { admin_token } = req.cookies;
      
      // Blacklist the admin token if it exists
      if (admin_token) {
        try {
          const decoded = jwt.verify(admin_token, process.env.JWT_SECRET_KEY);
          const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
          await blacklistToken(admin_token, Math.max(remainingTime, 3600)); // At least 1 hour
        } catch (jwtError) {
          // If token is invalid/expired, still blacklist it for 1 hour as safety measure
          await blacklistToken(admin_token, 3600);
        }
      }

      res.cookie("admin_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      
      res.status(200).json({
        success: true,
        message: "Admin logout successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Auto-login check endpoint - checks all token types and returns user info
router.get(
  "/me",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token, seller_token, admin_token } = req.cookies;
      
      // Check for user token first
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const user = await User.findById(decoded.id).select("-password");
          
          if (!user) {
            return next(new ErrorHandler("User not found", 404));
          }
          
          return res.status(200).json({
            success: true,
            user,
            userType: 'user',
            message: "User session verified"
          });
        } catch (jwtError) {
          // Token invalid/expired, continue to check other tokens
        }
      }
      
      // Check for seller token
      if (seller_token) {
        try {
          const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
          const shop = await Shop.findById(decoded.id).select("-password");
          
          if (!shop) {
            return next(new ErrorHandler("Shop not found", 404));
          }
          
          return res.status(200).json({
            success: true,
            seller: shop,
            userType: 'seller',
            message: "Seller session verified"
          });
        } catch (jwtError) {
          // Token invalid/expired, continue to check other tokens
        }
      }
      
      // Check for admin token
      if (admin_token) {
        try {
          const decoded = jwt.verify(admin_token, process.env.JWT_SECRET_KEY);
          const user = await User.findById(decoded.id).select("-password");
          
          if (!user || user.role !== "Admin") {
            return next(new ErrorHandler("Admin not found or access denied", 404));
          }
          
          return res.status(200).json({
            success: true,
            user,
            userType: 'admin',
            message: "Admin session verified"
          });
        } catch (jwtError) {
          // Token invalid/expired
        }
      }
      
      // No valid tokens found
      return next(new ErrorHandler("No valid session found", 401));
      
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// JWT Refresh endpoint for all token types
router.post(
  "/refresh",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token, seller_token, admin_token } = req.cookies;
      
      // Determine which token to refresh based on what's available
      if (token) {
        // Refresh user token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return next(new ErrorHandler("User not found", 404));
        }
        
        sendToken(user, 200, res);
      } else if (seller_token) {
        // Refresh shop token
        const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
        const shop = await Shop.findById(decoded.id);
        
        if (!shop) {
          return next(new ErrorHandler("Shop not found", 404));
        }
        
        sendShopToken(shop, 200, res);
      } else if (admin_token) {
        // Refresh admin token
        const decoded = jwt.verify(admin_token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== "Admin") {
          return next(new ErrorHandler("Admin not found", 404));
        }
        
        res.cookie("admin_token", user.getJwtToken(), {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(200).json({
          success: true,
          user,
          message: "Admin token refreshed"
        });
      } else {
        return next(new ErrorHandler("No valid token found for refresh", 401));
      }
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return next(new ErrorHandler("Invalid token, please login again", 401));
      } else if (error.name === "TokenExpiredError") {
        return next(new ErrorHandler("Token expired, please login again", 401));
      }
      return next(new ErrorHandler(error.message, 500));    }
  })
);

// Get current user/seller/admin session
router.get(
  "/me",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { token, seller_token, admin_token } = req.cookies;

      // Check for regular user token
      if (token) {
        try {
          // Check if token is blacklisted
          const { isTokenBlacklisted } = require("../middleware/tokenBlacklist");
          const blacklisted = await isTokenBlacklisted(token);
          if (blacklisted) {
            return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const user = await User.findById(decoded.id);

          if (!user) {
            return next(new ErrorHandler("User not found", 401));
          }

          return res.status(200).json({
            success: true,
            user,
            userType: 'user',
            isAuthenticated: true
          });
        } catch (jwtError) {
          console.error("User token verification failed:", jwtError.message);
          // Continue to check other tokens
        }
      }

      // Check for seller token
      if (seller_token) {
        try {
          // Check if seller token is blacklisted
          const { isTokenBlacklisted } = require("../middleware/tokenBlacklist");
          const blacklisted = await isTokenBlacklisted(seller_token);
          if (blacklisted) {
            return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
          }

          const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
          const seller = await Shop.findById(decoded.id);

          if (!seller) {
            return next(new ErrorHandler("Seller not found", 401));
          }

          return res.status(200).json({
            success: true,
            user: seller,
            userType: 'seller',
            isAuthenticated: true
          });
        } catch (jwtError) {
          console.error("Seller token verification failed:", jwtError.message);
          // Continue to check admin token
        }
      }

      // Check for admin token
      if (admin_token) {
        try {
          // Check if admin token is blacklisted
          const { isTokenBlacklisted } = require("../middleware/tokenBlacklist");
          const blacklisted = await isTokenBlacklisted(admin_token);
          if (blacklisted) {
            return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
          }

          const decoded = jwt.verify(admin_token, process.env.JWT_SECRET_KEY);
          const user = await User.findById(decoded.id);

          if (!user || user.role !== 'Admin') {
            return next(new ErrorHandler("Admin not found", 401));
          }

          return res.status(200).json({
            success: true,
            user,
            userType: 'admin',
            isAuthenticated: true
          });
        } catch (jwtError) {
          console.error("Admin token verification failed:", jwtError.message);
        }
      }

      // No valid tokens found
      return res.status(401).json({
        success: false,
        message: "No valid authentication token found",
        isAuthenticated: false
      });

    } catch (error) {
      console.error("Session verification error:", error);
      return next(new ErrorHandler("Session verification failed", 500));
    }
  })
);

module.exports = router;
