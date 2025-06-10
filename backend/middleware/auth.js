const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const SessionManager = require("../utils/sessionManager");
const Admin = require("../model/admin");

// Check if user is authenticated (now supports sellers as customers)
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("🔍 Validating user/customer session...");
    
    // First try to validate as user
    const userSession = await SessionManager.validateUserSession(req);
    
    if (userSession && userSession.isValid) {
      req.user = userSession.user;
      
      // Ensure both id and _id properties are available for consistency
      if (req.user.id && !req.user._id) {
        req.user._id = req.user.id;
      }
      if (!req.user.id && req.user._id) {
        req.user.id = req.user._id.toString();
      }
      
      console.log("✅ User authenticated successfully:", req.user.name, "ID:", req.user.id);
      return next();
    }
    
    // If no user session, try seller session (sellers can act as customers)
    const sellerSession = await SessionManager.validateShopSession(req);
    
    if (sellerSession && sellerSession.isValid) {
      // Convert seller to user-like object for customer functionality
      req.user = {
        id: sellerSession.shop.id,
        _id: sellerSession.shop._id || sellerSession.shop.id,
        name: sellerSession.shop.name,
        email: sellerSession.shop.email,
        phoneNumber: sellerSession.shop.phoneNumber,
        avatar: sellerSession.shop.avatar,
        role: 'seller_as_customer', // Special role to indicate seller acting as customer
        originalRole: 'seller',
        shopId: sellerSession.shop.id, // Keep reference to seller identity
        address: sellerSession.shop.address,
        zipCode: sellerSession.shop.zipCode
      };
      
      // Also set req.seller for dual access
      req.seller = sellerSession.shop;
      
      console.log("✅ Seller authenticated as customer:", req.user.name, "ID:", req.user.id);
      return next();
    }
    
    console.log("❌ No valid user or seller session found");
    return next(new ErrorHandler("Please login to continue", 401));
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("🔍 Validating shop session...");
    
    const shopSession = await SessionManager.validateShopSession(req);
    
    if (!shopSession || !shopSession.isValid) {
      console.log("❌ No valid shop session found");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    // Use the shop data from session validation
    req.seller = shopSession.shop;
    
    // Ensure both id and _id properties are available for consistency
    if (req.seller.id && !req.seller._id) {
      req.seller._id = req.seller.id;
    }
    if (!req.seller.id && req.seller._id) {
      req.seller.id = req.seller._id.toString();
    }
    
    console.log("✅ Seller authenticated successfully:", req.seller.name, "ID:", req.seller.id);
    next();
  } catch (error) {
    console.error("❌ Seller auth error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

// Admin authentication middleware
exports.isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("🔍 Validating admin session...");
    
    const adminSession = await SessionManager.validateAdminSession(req);
    
    if (!adminSession || !adminSession.isValid) {
      console.log("❌ No valid admin session found");
      return next(new ErrorHandler("Admin access required. Please login as admin.", 401));
    }
    
    // Set req.user for admin (this was missing!)
    req.user = adminSession.user;
    
    // Ensure both id and _id properties are available
    if (req.user.id && !req.user._id) {
      req.user._id = req.user.id;
    }
    if (!req.user.id && req.user._id) {
      req.user.id = req.user._id.toString();
    }
    
    console.log("✅ Admin authenticated successfully:", req.user.name, "Role:", req.user.role);
    next();
  } catch (error) {
    console.error("❌ Admin auth error:", error);
    return next(new ErrorHandler("Admin authentication error", 401));
  }
});

// Role-based authorization middleware (fixed)
exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", 401));
    }
    
    // Normalize roles for comparison (handle case variations)
    const normalizedUserRole = req.user.role.toLowerCase();
    const normalizedRoles = roles.map(role => role.toLowerCase());
    
    if (!normalizedRoles.includes(normalizedUserRole)) {
      return next(
        new ErrorHandler(`Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`, 403)
      );
    }
    next();
  };
};

// Super Admin specific middleware
exports.isSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const adminSession = await SessionManager.validateAdminSession(req);
    
    if (!adminSession || !adminSession.isValid) {
      return next(new ErrorHandler("Super Admin access required", 401));
    }
    
    req.user = adminSession.user;
    
    if (req.user.role !== 'superadmin') {
      return next(new ErrorHandler("Super Admin privileges required", 403));
    }
    
    console.log("✅ Super Admin authenticated:", req.user.name);
    next();
  } catch (error) {
    console.error("❌ Super Admin auth error:", error);
    return next(new ErrorHandler("Super Admin authentication error", 401));
  }
});
