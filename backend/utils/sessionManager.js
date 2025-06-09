/**
 * Session-based Authentication Manager
 * Replaces JWT token system with express-session based authentication
 * Works with Redis-backed sessions for persistence and scalability
 */

const User = require('../model/user');
const Shop = require('../model/shop');
const ErrorHandler = require('./ErrorHandler');

class SessionManager {
  /**
   * Create user session
   * @param {Object} req - Express request object
   * @param {Object} user - User document
   * @param {Object} options - Additional options
   */
  static async createUserSession(req, user, options = {}) {
    try {
      const {
        rememberMe = false,
        maxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 90 days or 1 day
      } = options;

      // Regenerate session ID for security
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session data
      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role || 'user',
        avatar: user.avatar || null,
        email: user.email || null
      };

      req.session.userType = 'user';
      req.session.isAuthenticated = true;
      req.session.loginTime = new Date().toISOString();

      // Set session cookie options
      req.session.cookie.maxAge = maxAge;
      req.session.cookie.secure = process.env.NODE_ENV === 'production';
      req.session.cookie.httpOnly = true;
      req.session.cookie.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`✅ User session created for ${user.name} (ID: ${user._id})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to create user session:', error);
      throw new ErrorHandler('Failed to create user session', 500);
    }
  }

  /**
   * Create shop session
   * @param {Object} req - Express request object
   * @param {Object} shop - Shop document
   * @param {Object} options - Additional options
   */
  static async createShopSession(req, shop, options = {}) {
    try {
      const {
        rememberMe = false,
        maxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 90 days or 1 day
      } = options;

      // Regenerate session ID for security
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session data
      req.session.seller = {
        id: shop._id.toString(),
        name: shop.name,
        shopName: shop.name,
        phoneNumber: shop.phoneNumber,
        description: shop.description || null,
        avatar: shop.avatar || null,
        email: shop.email || null,
        address: shop.address || null,
        zipCode: shop.zipCode || null
      };

      req.session.userType = 'seller';
      req.session.isAuthenticated = true;
      req.session.loginTime = new Date().toISOString();

      // Set session cookie options
      req.session.cookie.maxAge = maxAge;
      req.session.cookie.secure = process.env.NODE_ENV === 'production';
      req.session.cookie.httpOnly = true;
      req.session.cookie.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`✅ Shop session created for ${shop.name} (ID: ${shop._id})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to create shop session:', error);
      throw new ErrorHandler('Failed to create shop session', 500);
    }
  }

  /**
   * Create admin session
   * @param {Object} req - Express request object
   * @param {Object} user - User document with Admin role
   * @param {Object} options - Additional options
   */
  static async createAdminSession(req, user, options = {}) {
    try {
      if (user.role !== 'Admin') {
        throw new ErrorHandler('Access denied. Admin privileges required.', 403);
      }

      const {
        rememberMe = false,
        maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000 // 30 days or 8 hours
      } = options;

      // Regenerate session ID for security
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session data
      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar || null,
        email: user.email || null
      };

      req.session.userType = 'admin';
      req.session.isAuthenticated = true;
      req.session.loginTime = new Date().toISOString();

      // Set session cookie options (shorter duration for admin)
      req.session.cookie.maxAge = maxAge;
      req.session.cookie.secure = process.env.NODE_ENV === 'production';
      req.session.cookie.httpOnly = true;
      req.session.cookie.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`✅ Admin session created for ${user.name} (ID: ${user._id})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to create admin session:', error);
      throw error; // Re-throw to preserve error type
    }
  }

  /**
   * Validate user session
   * @param {Object} req - Express request object
   * @returns {Object|null} User data if valid, null otherwise
   */
  static validateUserSession(req) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return null;
      }

      if (req.session.userType !== 'user' && req.session.userType !== 'admin') {
        return null;
      }

      if (!req.session.user) {
        return null;
      }

      // Touch session to extend expiry
      req.session.touch();

      return req.session.user;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return null;
    }
  }

  /**
   * Validate shop session
   * @param {Object} req - Express request object
   * @returns {Object|null} Shop data if valid, null otherwise
   */
  static validateShopSession(req) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return null;
      }

      if (req.session.userType !== 'seller') {
        return null;
      }

      if (!req.session.seller) {
        return null;
      }

      // Touch session to extend expiry
      req.session.touch();

      return req.session.seller;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return null;
    }
  }

  /**
   * Validate admin session
   * @param {Object} req - Express request object
   * @returns {Object|null} Admin data if valid, null otherwise
   */
  static validateAdminSession(req) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return null;
      }

      if (req.session.userType !== 'admin') {
        return null;
      }

      if (!req.session.user || req.session.user.role !== 'Admin') {
        return null;
      }

      // Touch session to extend expiry
      req.session.touch();

      return req.session.user;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return null;
    }
  }

  /**
   * Get current session info
   * @param {Object} req - Express request object
   * @returns {Object} Session information
   */
  static getSessionInfo(req) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return {
          isAuthenticated: false,
          userType: null,
          user: null,
          sessionId: req.sessionID || null
        };
      }

      return {
        isAuthenticated: true,
        userType: req.session.userType,
        user: req.session.user || req.session.seller || null,
        sessionId: req.sessionID,
        loginTime: req.session.loginTime,
        lastAccess: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get session info:', error);
      return {
        isAuthenticated: false,
        userType: null,
        user: null,
        sessionId: req.sessionID || null,
        error: error.message
      };
    }
  }

  /**
   * Destroy session (logout)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<boolean>} Success status
   */
  static async destroySession(req, res) {
    try {
      const sessionInfo = this.getSessionInfo(req);
      
      // Clear session cookie
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.bhavyabazaar.com' : undefined
      });

      // Destroy session
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`✅ Session destroyed for ${sessionInfo.userType}: ${sessionInfo.user?.name || 'Unknown'}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to destroy session:', error);
      return false;
    }
  }

  /**
   * Update session data
   * @param {Object} req - Express request object
   * @param {Object} updates - Data to update
   * @returns {Promise<boolean>} Success status
   */
  static async updateSession(req, updates) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        throw new ErrorHandler('No active session to update', 401);
      }

      // Update user data if provided
      if (updates.user && req.session.user) {
        req.session.user = { ...req.session.user, ...updates.user };
      }

      // Update seller data if provided
      if (updates.seller && req.session.seller) {
        req.session.seller = { ...req.session.seller, ...updates.seller };
      }

      // Save updated session
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`✅ Session updated for ${req.session.userType}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to update session:', error);
      throw error;
    }
  }

  /**
   * Extend session expiry
   * @param {Object} req - Express request object
   * @param {number} additionalTime - Additional time in milliseconds
   * @returns {boolean} Success status
   */
  static extendSession(req, additionalTime = 24 * 60 * 60 * 1000) {
    try {
      if (!req.session || !req.session.isAuthenticated) {
        return false;
      }

      req.session.cookie.maxAge += additionalTime;
      req.session.touch();

      console.log(`✅ Session extended for ${req.session.userType}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to extend session:', error);
      return false;
    }
  }

  /**
   * Check if session is about to expire
   * @param {Object} req - Express request object
   * @param {number} thresholdMinutes - Warning threshold in minutes
   * @returns {boolean} True if session expires soon
   */
  static isSessionExpiringSoon(req, thresholdMinutes = 30) {
    try {
      if (!req.session || !req.session.cookie) {
        return false;
      }

      const now = Date.now();
      const expiryTime = new Date(req.session.cookie.expires || now + req.session.cookie.maxAge).getTime();
      const timeUntilExpiry = expiryTime - now;
      const thresholdMs = thresholdMinutes * 60 * 1000;

      return timeUntilExpiry <= thresholdMs;
    } catch (error) {
      console.error('❌ Failed to check session expiry:', error);
      return false;
    }
  }

  /**
   * Get session statistics
   * @param {Object} req - Express request object
   * @returns {Object} Session statistics
   */
  static getSessionStats(req) {
    try {
      if (!req.session) {
        return { hasSession: false };
      }

      const now = Date.now();
      const cookie = req.session.cookie;
      const loginTime = req.session.loginTime ? new Date(req.session.loginTime).getTime() : now;
      const expiryTime = cookie.expires ? new Date(cookie.expires).getTime() : now + (cookie.maxAge || 0);

      return {
        hasSession: true,
        isAuthenticated: req.session.isAuthenticated || false,
        userType: req.session.userType || null,
        sessionId: req.sessionID,
        loginTime: req.session.loginTime,
        timeLoggedIn: now - loginTime,
        timeUntilExpiry: Math.max(0, expiryTime - now),
        isExpiringSoon: this.isSessionExpiringSoon(req),
        cookieSecure: cookie.secure,
        cookieHttpOnly: cookie.httpOnly,
        cookieSameSite: cookie.sameSite
      };
    } catch (error) {
      console.error('❌ Failed to get session stats:', error);
      return { hasSession: false, error: error.message };
    }
  }
}

module.exports = SessionManager;