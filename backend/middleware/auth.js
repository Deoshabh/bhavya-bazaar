const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");
const sessionService = require("../utils/sessionService");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Auth cookies:", req.cookies);
    console.log("Auth headers:", req.headers.authorization);
    
    const { token } = req.cookies;
    
    if (!token) {
      console.log("No token found in cookies");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY missing in environment!");
      return next(new ErrorHandler("Server configuration error", 500));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token user ID:", decoded.id);
    
    // Try to get user from cache first
    let user = await sessionService.getUserSession(decoded.id);
    
    if (!user) {
      console.log("User not found in cache, fetching from database");
      // If not in cache, get from database and cache it
      user = await User.findById(decoded.id);
      
      if (!user) {
        console.error("User not found in database for token ID:", decoded.id);
        console.log("This indicates a stale or invalid token - user may have been deleted");
        return next(new ErrorHandler("Session expired. Please login again.", 401));
      }
      
      // Cache user session for 30 minutes
      await sessionService.setUserSession(decoded.id, user, 1800);
      console.log("User cached successfully");
    } else {
      console.log("User found in cache");
    }
    
    req.user = user;
    console.log("User authenticated successfully:", user._id);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }
    return next(new ErrorHandler("Authentication error", 401));
  }
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Seller auth cookies:", req.cookies);
    const { seller_token } = req.cookies;
    
    if (!seller_token) {
      console.error("No seller token in cookies");
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY missing in environment!");
      return next(new ErrorHandler("Server configuration error", 500));
    }
    
    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
    console.log("Decoded seller token:", decoded);
    
    // Try to get seller from cache first
    let seller = await sessionService.getShopSession(decoded.id);
    
    if (!seller) {
      // If not in cache, get from database and cache it
      seller = await Shop.findById(decoded.id);
      
      if (!seller) {
        console.error("Seller not found for id:", decoded.id);
        return next(new ErrorHandler("Seller not found", 401));
      }
      
      // Cache seller session for 30 minutes
      await sessionService.setShopSession(decoded.id, seller, 1800);
    }
    
    req.seller = seller;
    console.log("Seller authenticated successfully:", seller._id);
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }
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
