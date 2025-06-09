const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const SessionManager = require("../utils/sessionManager");

/**
 * Role-based authentication guards for unified auth system
 */

// Require user authentication (checks session)
exports.requireUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const userSession = await SessionManager.validateUserSession(req);
    
    if (!userSession.isValid) {
      return next(new ErrorHandler("User authentication required. Please login.", 401));
    }
    
    req.user = userSession.user;
    next();
  } catch (error) {
    console.error("User auth error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Require shop authentication (checks session)
exports.requireShop = catchAsyncErrors(async (req, res, next) => {
  try {
    const shopSession = await SessionManager.validateShopSession(req);
    
    if (!shopSession.isValid) {
      return next(new ErrorHandler("Shop authentication required. Please login.", 401));
    }
    
    req.seller = shopSession.shop;
    next();
  } catch (error) {
    console.error("Shop auth error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Require admin authentication (checks session for admin role)
exports.requireAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const adminSession = await SessionManager.validateAdminSession(req);
    
    if (!adminSession.isValid) {
      return next(new ErrorHandler("Admin authentication required. Please login.", 401));
    }
    
    req.user = adminSession.user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Optional user authentication (doesn't fail if no session, but sets req.user if valid session exists)
exports.optionalUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const userSession = await SessionManager.validateUserSession(req);
    
    if (userSession.isValid) {
      req.user = userSession.user;
    }
    
    next();
  } catch (error) {
    // In optional auth, we don't fail on errors, just continue without user
    next();
  }
});

// Optional shop authentication (doesn't fail if no session, but sets req.seller if valid session exists)
exports.optionalShop = catchAsyncErrors(async (req, res, next) => {
  try {
    const shopSession = await SessionManager.validateShopSession(req);
    
    if (shopSession.isValid) {
      req.seller = shopSession.shop;
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
