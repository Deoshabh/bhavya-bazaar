class SessionService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour for sessions
    this.sessions = new Map(); // In-memory session storage as fallback
  }

  /**
   * Store user session in memory
   * @param {string} userId - User ID
   * @param {Object} userData - User data to store
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setUserSession(userId, userData, ttl = this.defaultTTL) {
    try {
      const key = `user:${userId}`;
      this.sessions.set(key, {
        data: userData,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting user session:', error);
      return false;
    }
  }

  /**
   * Get user session from memory
   * @param {string} userId - User ID
   */
  async getUserSession(userId) {
    try {
      const key = `user:${userId}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Store shop session in memory
   * @param {string} shopId - Shop ID
   * @param {Object} shopData - Shop data to store
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setShopSession(shopId, shopData, ttl = this.defaultTTL) {
    try {
      const key = `shop:${shopId}`;
      this.sessions.set(key, {
        data: shopData,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting shop session:', error);
      return false;
    }  }

  /**
   * Get shop session from memory
   * @param {string} shopId - Shop ID
   */
  async getShopSession(shopId) {
    try {
      const key = `shop:${shopId}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting shop session:', error);
      return null;
    }
  }

  /**
   * Store JWT token session in memory
   * @param {string} token - JWT token
   * @param {Object} payload - Token payload
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setTokenSession(token, payload, ttl = this.defaultTTL) {
    try {
      const key = `token:${token}`;
      this.sessions.set(key, {
        data: payload,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting token session:', error);
      return false;
    }
  }

  /**
   * Get JWT token session from memory
   * @param {string} token - JWT token
   */
  async getTokenSession(token) {
    try {
      const key = `token:${token}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting token session:', error);
      return null;
    }
  }
  /**
   * Invalidate user session from memory
   * @param {string} userId - User ID
   */
  async invalidateUserSession(userId) {
    try {
      const key = `user:${userId}`;
      return this.sessions.delete(key);
    } catch (error) {
      console.error('Error invalidating user session:', error);
      return false;
    }
  }

  /**
   * Invalidate shop session from memory
   * @param {string} shopId - Shop ID
   */
  async invalidateShopSession(shopId) {
    try {
      const key = `shop:${shopId}`;
      return this.sessions.delete(key);
    } catch (error) {
      console.error('Error invalidating shop session:', error);
      return false;
    }
  }

  /**
   * Invalidate token session from memory
   * @param {string} token - JWT token
   */
  async invalidateTokenSession(token) {
    try {
      const key = `token:${token}`;
      return this.sessions.delete(key);
    } catch (error) {
      console.error('Error invalidating token session:', error);
      return false;
    }
  }
  /**
   * Store user cart in memory
   * @param {string} userId - User ID
   * @param {Array} cartItems - Cart items
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setUserCart(userId, cartItems, ttl = 86400) { // 24 hours for cart
    try {
      const key = `cart:${userId}`;
      this.sessions.set(key, {
        data: cartItems,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting user cart:', error);
      return false;
    }
  }

  /**
   * Get user cart from memory
   * @param {string} userId - User ID
   */
  async getUserCart(userId) {
    try {
      const key = `cart:${userId}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting user cart:', error);
      return null;
    }
  }

  /**
   * Store user wishlist in memory
   * @param {string} userId - User ID
   * @param {Array} wishlistItems - Wishlist items
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setUserWishlist(userId, wishlistItems, ttl = 86400) { // 24 hours for wishlist
    try {
      const key = `wishlist:${userId}`;
      this.sessions.set(key, {
        data: wishlistItems,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting user wishlist:', error);
      return false;
    }
  }

  /**
   * Get user wishlist from memory
   * @param {string} userId - User ID
   */
  async getUserWishlist(userId) {
    try {
      const key = `wishlist:${userId}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return null;
    }
  }

  /**
   * Store recent searches for a user in memory
   * @param {string} userId - User ID
   * @param {Array} searches - Recent searches
   * @param {number} ttl - Time to live in seconds (not used in memory storage)
   */
  async setRecentSearches(userId, searches, ttl = 86400) { // 24 hours
    try {
      const key = `searches:${userId}`;
      this.sessions.set(key, {
        data: searches,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error setting recent searches:', error);
      return false;
    }
  }

  /**
   * Get recent searches for a user from memory
   * @param {string} userId - User ID
   */
  async getRecentSearches(userId) {
    try {
      const key = `searches:${userId}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return null;
    }
  }

  /**
   * Track user activity in memory
   * @param {string} userId - User ID
   * @param {string} activity - Activity type
   * @param {Object} data - Activity data
   */
  async trackActivity(userId, activity, data) {
    try {
      const key = `activity:${userId}:${activity}`;      const timestamp = new Date().toISOString();
      const activityData = { ...data, timestamp };
      this.sessions.set(key, {
        data: activityData,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return false;
    }
  }

  /**
   * Get user activity from memory
   * @param {string} userId - User ID
   * @param {string} activity - Activity type
   */
  async getActivity(userId, activity) {
    try {
      const key = `activity:${userId}:${activity}`;
      const session = this.sessions.get(key);
      return session ? session.data : null;
    } catch (error) {
      console.error('Error getting activity:', error);
      return null;
    }
  }

  /**
   * Clear all sessions from memory
   */
  clearAllSessions() {
    this.sessions.clear();
    console.log('All sessions cleared from memory');
  }

  /**
   * Get session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
}

module.exports = new SessionService();
