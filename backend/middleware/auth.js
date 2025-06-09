const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const SessionManager = require("../utils/sessionManager");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Validating user session...");
    
    const userSession = await SessionManager.validateUserSession(req);
    
    if (!userSession) {
      console.log("No valid user session found");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    req.user = userSession;
    // Ensure id property is available for consistency
    if (!req.user.id && req.user._id) {
      req.user.id = req.user._id.toString();
    }
    console.log("User authenticated successfully:", req.user._id);
    console.log("req.user.id set to:", req.user.id);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return next(new ErrorHandler("Authentication error", 401));
  }
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Validating shop session...");
    
    const shopSession = await SessionManager.validateShopSession(req);
    
    if (!shopSession) {
      console.log("No valid shop session found");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    req.seller = shopSession;
    // Ensure id property is available for consistency
    if (!req.seller.id && req.seller._id) {
      req.seller.id = req.seller._id.toString();
    }
    console.log("Seller authenticated successfully:", req.seller._id);
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
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
