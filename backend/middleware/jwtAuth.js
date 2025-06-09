const JWTManager = require('../utils/jwtToken');
const User = require('../model/user');
const Shop = require('../model/shop');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');

/**
 * JWT-based authentication middleware for users
 */
const authenticateUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = JWTManager.getToken(req, 'user');
    
    if (!token) {
      return next(new ErrorHandler('Please login to access this resource', 401));
    }

    const decoded = JWTManager.verifyToken(token);
    
    // Verify user type
    if (decoded.userType !== 'user') {
      return next(new ErrorHandler('Invalid user token', 401));
    }

    // Fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler('User not found', 401));
    }

    // Attach user to request
    req.user = user;
    req.userType = 'user';
    req.tokenDecoded = decoded;

    // Auto-refresh token if expiring soon
    if (JWTManager.isTokenExpiringSoon(token)) {
      const newToken = JWTManager.refreshToken(token, 'user');
      res.cookie(JWTManager.COOKIE_NAMES.USER, newToken, JWTManager.getCookieOptions());
    }

    next();
  } catch (error) {
    if (error.message === 'Token has expired' || error.message === 'Invalid token') {
      // Clear invalid/expired cookie
      JWTManager.clearTokenCookies(res, 'user');
      return next(new ErrorHandler('Session expired. Please login again', 401));
    }
    return next(new ErrorHandler('Authentication failed', 500));
  }
});

/**
 * JWT-based authentication middleware for sellers/shops
 */
const authenticateSeller = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = JWTManager.getToken(req, 'seller');
    
    if (!token) {
      return next(new ErrorHandler('Please login as seller to access this resource', 401));
    }

    const decoded = JWTManager.verifyToken(token);
    
    // Verify user type
    if (decoded.userType !== 'seller') {
      return next(new ErrorHandler('Invalid seller token', 401));
    }

    // Fetch shop from database
    const shop = await Shop.findById(decoded.id);
    if (!shop) {
      return next(new ErrorHandler('Shop not found', 401));
    }

    // Attach seller to request
    req.seller = shop;
    req.userType = 'seller';
    req.tokenDecoded = decoded;

    // Auto-refresh token if expiring soon
    if (JWTManager.isTokenExpiringSoon(token)) {
      const newToken = JWTManager.refreshToken(token, 'seller');
      res.cookie(JWTManager.COOKIE_NAMES.SELLER, newToken, JWTManager.getCookieOptions());
    }

    next();
  } catch (error) {
    if (error.message === 'Token has expired' || error.message === 'Invalid token') {
      // Clear invalid/expired cookie
      JWTManager.clearTokenCookies(res, 'seller');
      return next(new ErrorHandler('Session expired. Please login again', 401));
    }
    return next(new ErrorHandler('Authentication failed', 500));
  }
});

/**
 * JWT-based authentication middleware for admins
 */
const authenticateAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = JWTManager.getToken(req, 'admin');
    
    if (!token) {
      return next(new ErrorHandler('Please login as admin to access this resource', 401));
    }

    const decoded = JWTManager.verifyToken(token);
    
    // Verify user type
    if (decoded.userType !== 'admin') {
      return next(new ErrorHandler('Invalid admin token', 401));
    }

    // Fetch user from database and verify admin role
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'Admin') {
      return next(new ErrorHandler('Admin access denied', 403));
    }

    // Attach admin to request
    req.user = user;
    req.userType = 'admin';
    req.tokenDecoded = decoded;

    // Auto-refresh token if expiring soon
    if (JWTManager.isTokenExpiringSoon(token)) {
      const newToken = JWTManager.refreshToken(token, 'admin');
      res.cookie(JWTManager.COOKIE_NAMES.ADMIN, newToken, JWTManager.getCookieOptions());
    }

    next();
  } catch (error) {
    if (error.message === 'Token has expired' || error.message === 'Invalid token') {
      // Clear invalid/expired cookie
      JWTManager.clearTokenCookies(res, 'admin');
      return next(new ErrorHandler('Session expired. Please login again', 401));
    }
    return next(new ErrorHandler('Authentication failed', 500));
  }
});

/**
 * Universal authentication middleware - tries to authenticate any valid user type
 * This is useful for endpoints that accept multiple user types
 */
const authenticateAny = catchAsyncErrors(async (req, res, next) => {
  // Try user authentication first
  const userToken = JWTManager.getToken(req, 'user');
  if (userToken) {
    try {
      const decoded = JWTManager.verifyToken(userToken);
      if (decoded.userType === 'user') {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          req.userType = 'user';
          req.tokenDecoded = decoded;
          
          // Auto-refresh if needed
          if (JWTManager.isTokenExpiringSoon(userToken)) {
            const newToken = JWTManager.refreshToken(userToken, 'user');
            res.cookie(JWTManager.COOKIE_NAMES.USER, newToken, JWTManager.getCookieOptions());
          }
          
          return next();
        }
      }
    } catch (error) {
      // Continue to try other token types
    }
  }

  // Try seller authentication
  const sellerToken = JWTManager.getToken(req, 'seller');
  if (sellerToken) {
    try {
      const decoded = JWTManager.verifyToken(sellerToken);
      if (decoded.userType === 'seller') {
        const shop = await Shop.findById(decoded.id);
        if (shop) {
          req.seller = shop;
          req.userType = 'seller';
          req.tokenDecoded = decoded;
          
          // Auto-refresh if needed
          if (JWTManager.isTokenExpiringSoon(sellerToken)) {
            const newToken = JWTManager.refreshToken(sellerToken, 'seller');
            res.cookie(JWTManager.COOKIE_NAMES.SELLER, newToken, JWTManager.getCookieOptions());
          }
          
          return next();
        }
      }
    } catch (error) {
      // Continue to try other token types
    }
  }

  // Try admin authentication
  const adminToken = JWTManager.getToken(req, 'admin');
  if (adminToken) {
    try {
      const decoded = JWTManager.verifyToken(adminToken);
      if (decoded.userType === 'admin') {
        const user = await User.findById(decoded.id);
        if (user && user.role === 'Admin') {
          req.user = user;
          req.userType = 'admin';
          req.tokenDecoded = decoded;
          
          // Auto-refresh if needed
          if (JWTManager.isTokenExpiringSoon(adminToken)) {
            const newToken = JWTManager.refreshToken(adminToken, 'admin');
            res.cookie(JWTManager.COOKIE_NAMES.ADMIN, newToken, JWTManager.getCookieOptions());
          }
          
          return next();
        }
      }
    } catch (error) {
      // No valid tokens found
    }
  }

  // No valid authentication found
  return next(new ErrorHandler('Please login to access this resource', 401));
});

/**
 * Optional authentication middleware - sets user if token exists but doesn't require it
 * Useful for endpoints that work with or without authentication
 */
const optionalAuth = catchAsyncErrors(async (req, res, next) => {
  try {
    // Try to authenticate but don't fail if no token exists
    await authenticateAny(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
});

module.exports = {
  authenticateUser,
  authenticateSeller,
  authenticateAdmin,
  authenticateAny,
  optionalAuth,
  
  // Legacy aliases for backward compatibility
  isAuthenticated: authenticateUser,
  isSeller: authenticateSeller,
  isAdmin: authenticateAdmin
};
