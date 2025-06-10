const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const SessionManager = require("../utils/sessionManager");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("🔍 Validating user session...");
    
    const userSession = await SessionManager.validateUserSession(req);
    
    if (!userSession || !userSession.isValid) {
      console.log("❌ No valid user session found");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    // Use the user data from session validation
    req.user = userSession.user;
    
    // Ensure both id and _id properties are available for consistency
    if (req.user.id && !req.user._id) {
      req.user._id = req.user.id;
    }
    if (!req.user.id && req.user._id) {
      req.user.id = req.user._id.toString();
    }
    console.log("✅ User authenticated successfully:", req.user.name, "ID:", req.user.id);
    next();
  } catch (error) {
    console.error("❌ User auth error:", error);
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

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resource!`, 403)
      );
    }
    next();
  };
};
