const jwt = require('jsonwebtoken');

class JWTManager {
  // Token expiration settings
  static TOKEN_EXPIRES = process.env.JWT_EXPIRES || '90d'; // 90 days for long-lived sessions
  static JWT_SECRET = process.env.JWT_SECRET_KEY;

  // Cookie names for different user types
  static COOKIE_NAMES = {
    USER: 'token',
    SELLER: 'seller_token',
    ADMIN: 'admin_token'
  };

  // Cookie options for production and development
  static getCookieOptions(maxAge = 90 * 24 * 60 * 60 * 1000) { // 90 days default
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: maxAge,
      path: '/'
    };
  }

  /**
   * Generate JWT token for a user
   * @param {Object} user - User object (User/Shop/Admin)
   * @param {string} userType - Type of user: 'user', 'seller', 'admin'
   * @returns {string} JWT token
   */
  static generateToken(user, userType) {
    if (!user || !user._id) {
      throw new Error('User object with _id is required to generate token');
    }

    const payload = {
      id: user._id.toString(),
      userType: userType,
      role: user.role || userType,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRES
    });
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Set JWT cookie for a user
   * @param {Object} res - Express response object
   * @param {Object} user - User object
   * @param {string} userType - Type of user: 'user', 'seller', 'admin'
   */
  static setTokenCookie(res, user, userType) {
    const token = this.generateToken(user, userType);
    const cookieName = this.COOKIE_NAMES[userType.toUpperCase()];
    
    if (!cookieName) {
      throw new Error(`Invalid user type: ${userType}`);
    }

    res.cookie(cookieName, token, this.getCookieOptions());
    return token;
  }

  /**
   * Clear JWT cookies for logout
   * @param {Object} res - Express response object
   * @param {string} userType - Type of user: 'user', 'seller', 'admin', or 'all'
   */
  static clearTokenCookies(res, userType = 'all') {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    };

    if (userType === 'all') {
      // Clear all authentication cookies
      Object.values(this.COOKIE_NAMES).forEach(cookieName => {
        res.clearCookie(cookieName, cookieOptions);
      });
    } else {
      const cookieName = this.COOKIE_NAMES[userType.toUpperCase()];
      if (cookieName) {
        res.clearCookie(cookieName, cookieOptions);
      }
    }
  }

  /**
   * Extract token from request cookies
   * @param {Object} req - Express request object
   * @param {string} userType - Type of user: 'user', 'seller', 'admin'
   * @returns {string|null} JWT token or null if not found
   */
  static getTokenFromCookies(req, userType) {
    const cookieName = this.COOKIE_NAMES[userType.toUpperCase()];
    return req.cookies?.[cookieName] || null;
  }

  /**
   * Extract token from Authorization header (Bearer token)
   * @param {Object} req - Express request object
   * @returns {string|null} JWT token or null if not found
   */
  static getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Get token from either cookies or Authorization header
   * @param {Object} req - Express request object
   * @param {string} userType - Type of user: 'user', 'seller', 'admin'
   * @returns {string|null} JWT token or null if not found
   */
  static getToken(req, userType) {
    // Try cookies first (preferred for web apps)
    let token = this.getTokenFromCookies(req, userType);
    
    // Fallback to Authorization header (for API clients)
    if (!token) {
      token = this.getTokenFromHeader(req);
    }
    
    return token;
  }

  /**
   * Refresh token - generate new token with extended expiry
   * @param {string} token - Current JWT token
   * @param {string} userType - Type of user
   * @returns {string} New JWT token
   */
  static refreshToken(token, userType) {
    const decoded = this.verifyToken(token);
    
    // Create new token with same payload but fresh timestamp
    const newPayload = {
      id: decoded.id,
      userType: userType,
      role: decoded.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(newPayload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRES
    });
  }

  /**
   * Check if token is about to expire (within 7 days)
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token expires soon
   */
  static isTokenExpiringSoon(token) {
    try {
      const decoded = this.verifyToken(token);
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      
      return expiresIn < sevenDaysInSeconds;
    } catch (error) {
      return true; // If token is invalid, consider it as expiring
    }
  }
}

module.exports = JWTManager;