const redisClient = require('../utils/redisClient');

/**
 * Middleware to check if JWT token is blacklisted
 */
const checkBlacklistedToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      return next(); // No token, let auth middleware handle it
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.'
      });
    }

    // Token is valid, continue
    next();
  } catch (error) {
    console.error('Error checking blacklisted token:', error);
    // If Redis is down, don't block the request
    next();
  }
};

/**
 * Blacklist a token (used during logout)
 */
const blacklistToken = async (token, expiresIn = 3600) => {
  try {
    return await redisClient.blacklistToken(token, expiresIn);
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Remove token from blacklist (rarely used)
 */
const removeTokenFromBlacklist = async (token) => {
  try {
    return await redisClient.removeTokenFromBlacklist(token);
  } catch (error) {
    console.error('Error removing token from blacklist:', error);
    return false;
  }
};

/**
 * Check if token is blacklisted without middleware wrapper
 */
const isTokenBlacklisted = async (token) => {
  try {
    return await redisClient.isTokenBlacklisted(token);
  } catch (error) {
    console.error('Error checking if token is blacklisted:', error);
    return false; // If Redis is down, assume token is not blacklisted
  }
};

module.exports = {
  checkBlacklistedToken,
  blacklistToken,
  removeTokenFromBlacklist,
  isTokenBlacklisted
};
