const cacheService = require('./cacheService');

class SessionService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour for sessions
  }

  /**
   * Store user session in cache
   * @param {string} userId - User ID
   * @param {Object} userData - User data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async setUserSession(userId, userData, ttl = this.defaultTTL) {
    try {
      const key = cacheService.generateUserKey(userId);
      return await cacheService.set(key, userData, ttl);
    } catch (error) {
      console.error('Error setting user session:', error);
      return false;
    }
  }

  /**
   * Get user session from cache
   * @param {string} userId - User ID
   */
  async getUserSession(userId) {
    try {
      const key = cacheService.generateUserKey(userId);
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Store shop session in cache
   * @param {string} shopId - Shop ID
   * @param {Object} shopData - Shop data to cache
   * @param {number} ttl - Time to live in seconds
   */
  async setShopSession(shopId, shopData, ttl = this.defaultTTL) {
    try {
      const key = cacheService.generateShopKey(shopId);
      return await cacheService.set(key, shopData, ttl);
    } catch (error) {
      console.error('Error setting shop session:', error);
      return false;
    }
  }

  /**
   * Get shop session from cache
   * @param {string} shopId - Shop ID
   */
  async getShopSession(shopId) {
    try {
      const key = cacheService.generateShopKey(shopId);
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting shop session:', error);
      return null;
    }
  }

  /**
   * Store JWT token session
   * @param {string} token - JWT token
   * @param {Object} payload - Token payload
   * @param {number} ttl - Time to live in seconds
   */
  async setTokenSession(token, payload, ttl = this.defaultTTL) {
    try {
      const key = `token:${token}`;
      return await cacheService.set(key, payload, ttl);
    } catch (error) {
      console.error('Error setting token session:', error);
      return false;
    }
  }

  /**
   * Get JWT token session
   * @param {string} token - JWT token
   */
  async getTokenSession(token) {
    try {
      const key = `token:${token}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting token session:', error);
      return null;
    }
  }

  /**
   * Invalidate user session
   * @param {string} userId - User ID
   */
  async invalidateUserSession(userId) {
    try {
      const key = cacheService.generateUserKey(userId);
      return await cacheService.del(key);
    } catch (error) {
      console.error('Error invalidating user session:', error);
      return false;
    }
  }

  /**
   * Invalidate shop session
   * @param {string} shopId - Shop ID
   */
  async invalidateShopSession(shopId) {
    try {
      const key = cacheService.generateShopKey(shopId);
      return await cacheService.del(key);
    } catch (error) {
      console.error('Error invalidating shop session:', error);
      return false;
    }
  }

  /**
   * Invalidate token session
   * @param {string} token - JWT token
   */
  async invalidateTokenSession(token) {
    try {
      const key = `token:${token}`;
      return await cacheService.del(key);
    } catch (error) {
      console.error('Error invalidating token session:', error);
      return false;
    }
  }

  /**
   * Store user cart in cache
   * @param {string} userId - User ID
   * @param {Array} cartItems - Cart items
   * @param {number} ttl - Time to live in seconds
   */
  async setUserCart(userId, cartItems, ttl = 86400) { // 24 hours for cart
    try {
      const key = `cart:${userId}`;
      return await cacheService.set(key, cartItems, ttl);
    } catch (error) {
      console.error('Error setting user cart:', error);
      return false;
    }
  }

  /**
   * Get user cart from cache
   * @param {string} userId - User ID
   */
  async getUserCart(userId) {
    try {
      const key = `cart:${userId}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting user cart:', error);
      return null;
    }
  }

  /**
   * Store user wishlist in cache
   * @param {string} userId - User ID
   * @param {Array} wishlistItems - Wishlist items
   * @param {number} ttl - Time to live in seconds
   */
  async setUserWishlist(userId, wishlistItems, ttl = 86400) { // 24 hours for wishlist
    try {
      const key = `wishlist:${userId}`;
      return await cacheService.set(key, wishlistItems, ttl);
    } catch (error) {
      console.error('Error setting user wishlist:', error);
      return false;
    }
  }

  /**
   * Get user wishlist from cache
   * @param {string} userId - User ID
   */
  async getUserWishlist(userId) {
    try {
      const key = `wishlist:${userId}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return null;
    }
  }

  /**
   * Store recent searches for a user
   * @param {string} userId - User ID
   * @param {Array} searches - Recent searches
   * @param {number} ttl - Time to live in seconds
   */
  async setRecentSearches(userId, searches, ttl = 86400) { // 24 hours
    try {
      const key = `searches:${userId}`;
      return await cacheService.set(key, searches, ttl);
    } catch (error) {
      console.error('Error setting recent searches:', error);
      return false;
    }
  }

  /**
   * Get recent searches for a user
   * @param {string} userId - User ID
   */
  async getRecentSearches(userId) {
    try {
      const key = `searches:${userId}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return null;
    }
  }

  /**
   * Track user activity
   * @param {string} userId - User ID
   * @param {string} activity - Activity type
   * @param {Object} data - Activity data
   */
  async trackActivity(userId, activity, data) {
    try {
      const key = `activity:${userId}:${activity}`;
      const timestamp = new Date().toISOString();
      const activityData = { ...data, timestamp };
      return await cacheService.set(key, activityData, 3600); // 1 hour
    } catch (error) {
      console.error('Error tracking activity:', error);
      return false;
    }
  }

  /**
   * Get user activity
   * @param {string} userId - User ID
   * @param {string} activity - Activity type
   */
  async getActivity(userId, activity) {
    try {
      const key = `activity:${userId}:${activity}`;
      return await cacheService.get(key);
    } catch (error) {
      console.error('Error getting activity:', error);
      return null;
    }
  }
}

module.exports = new SessionService();
