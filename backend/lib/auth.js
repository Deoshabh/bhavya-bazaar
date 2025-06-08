const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const { isTokenBlacklisted } = require("../middleware/tokenBlacklist");

/**
 * Role-based authentication guards for unified auth system
 */

// Require user authentication (checks token cookie)
exports.requireUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return next(new ErrorHandler("User authentication required. Please login.", 401));
    }
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY missing in environment!");
      return next(new ErrorHandler("Server configuration error", 500));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("User auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Require shop authentication (checks seller_token cookie)
exports.requireShop = catchAsyncErrors(async (req, res, next) => {
  try {
    const { seller_token } = req.cookies;
    
    if (!seller_token) {
      return next(new ErrorHandler("Shop authentication required. Please login.", 401));
    }
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(seller_token);
    if (blacklisted) {
      return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY missing in environment!");
      return next(new ErrorHandler("Server configuration error", 500));
    }
    
    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    const shop = await Shop.findById(decoded.id);
    
    if (!shop) {
      return next(new ErrorHandler("Shop not found", 401));
    }
    
    req.seller = shop;
    next();
  } catch (error) {
    console.error("Shop auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Require admin authentication (checks admin_token cookie or token with Admin role)
exports.requireAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const { admin_token, token } = req.cookies;
    
    // Try admin_token first, then fall back to regular token
    const authToken = admin_token || token;
    
    if (!authToken) {
      return next(new ErrorHandler("Admin authentication required. Please login.", 401));
    }
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(authToken);
    if (blacklisted) {
      return next(new ErrorHandler("Token has been invalidated. Please login again.", 401));
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY missing in environment!");
      return next(new ErrorHandler("Server configuration error", 500));
    }
    
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    
    if (user.role !== "Admin") {
      return next(new ErrorHandler("Admin privileges required", 403));
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Optional user authentication (doesn't fail if no token, but sets req.user if valid token exists)
exports.optionalUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { token } = req.cookies;
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return next(); // Continue without authentication
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      return next(); // Continue without authentication
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // In optional auth, we don't fail on errors, just continue without user
    next();
  }
});

// Optional shop authentication (doesn't fail if no token, but sets req.seller if valid token exists)
exports.optionalShop = catchAsyncErrors(async (req, res, next) => {
  try {
    const { seller_token } = req.cookies;
    
    if (!seller_token) {
      return next(); // Continue without authentication
    }
    
    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(seller_token);
    if (blacklisted) {
      return next(); // Continue without authentication
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      return next(); // Continue without authentication
    }
    
    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    const shop = await Shop.findById(decoded.id);
    
    if (shop) {
      req.seller = shop;
    }
    
    next();
  } catch (error) {
    // In optional auth, we don't fail on errors, just continue without seller
    next();
  }
});

// Helper function to check if user has specific role
exports.requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`${req.user.role} cannot access this resource`, 403));
    }
    
    next();
  };
};
