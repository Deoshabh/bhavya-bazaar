const redisClient = require('./redisClient');

class SessionService {
  constructor() {
    // Fallback in-memory storage when Redis is not available
    this.memoryStore = {
      userSessions: new Map(),
      shopSessions: new Map(),
      tokenSessions: new Map(),
      cartSessions: new Map(),
      wishlistSessions: new Map(),
      searchSessions: new Map(),
      activitySessions: new Map()
    };
  }

  async storeUserSession(userId, userData, ttl = 86400) {
    try {
      // Try Redis first
      const redisSuccess = await redisClient.setSession(`user:${userId}`, userData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      // Fallback to memory
      this.memoryStore.userSessions.set(userId, {
        data: userData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing user session:', error);
      return false;
    }
  }

  async getUserSession(userId) {
    try {
      // Try Redis first
      const redisData = await redisClient.getSession(`user:${userId}`);
      if (redisData) {
        return redisData;
      }
      
      // Fallback to memory
      const memoryData = this.memoryStore.userSessions.get(userId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      // Clean expired memory data
      if (memoryData) {
        this.memoryStore.userSessions.delete(userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving user session:', error);
      return null;
    }
  }

  async deleteUserSession(userId) {
    try {
      // Try Redis first
      await redisClient.deleteSession(`user:${userId}`);
      
      // Also remove from memory
      this.memoryStore.userSessions.delete(userId);
      return true;
    } catch (error) {
      console.error('Error deleting user session:', error);
      return false;
    }
  }

  async storeShopSession(shopId, shopData, ttl = 86400) {
    try {
      const redisSuccess = await redisClient.setSession(`shop:${shopId}`, shopData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.shopSessions.set(shopId, {
        data: shopData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing shop session:', error);
      return false;
    }
  }

  async getShopSession(shopId) {
    try {
      const redisData = await redisClient.getSession(`shop:${shopId}`);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.shopSessions.get(shopId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.shopSessions.delete(shopId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving shop session:', error);
      return null;
    }
  }

  async deleteShopSession(shopId) {
    try {
      await redisClient.deleteSession(`shop:${shopId}`);
      this.memoryStore.shopSessions.delete(shopId);
      return true;
    } catch (error) {
      console.error('Error deleting shop session:', error);
      return false;
    }
  }

  async storeTokenSession(token, tokenData, ttl = 86400) {
    try {
      const redisSuccess = await redisClient.setSession(`token:${token}`, tokenData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.tokenSessions.set(token, {
        data: tokenData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing token session:', error);
      return false;
    }
  }

  async getTokenSession(token) {
    try {
      const redisData = await redisClient.getSession(`token:${token}`);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.tokenSessions.get(token);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.tokenSessions.delete(token);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving token session:', error);
      return null;
    }
  }

  async deleteTokenSession(token) {
    try {
      await redisClient.deleteSession(`token:${token}`);
      this.memoryStore.tokenSessions.delete(token);
      return true;
    } catch (error) {
      console.error('Error deleting token session:', error);
      return false;
    }
  }

  // Cart session management with Redis persistence
  async storeCartSession(userId, cartData, ttl = 604800) { // 7 days
    try {
      const redisSuccess = await redisClient.setCart(userId, cartData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.cartSessions.set(userId, {
        data: cartData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing cart session:', error);
      return false;
    }
  }

  async getCartSession(userId) {
    try {
      const redisData = await redisClient.getCart(userId);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.cartSessions.get(userId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.cartSessions.delete(userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving cart session:', error);
      return null;
    }
  }

  async deleteCartSession(userId) {
    try {
      await redisClient.deleteCart(userId);
      this.memoryStore.cartSessions.delete(userId);
      return true;
    } catch (error) {
      console.error('Error deleting cart session:', error);
      return false;
    }
  }

  async storeWishlistSession(userId, wishlistData, ttl = 2592000) { // 30 days
    try {
      const redisSuccess = await redisClient.setSession(`wishlist:${userId}`, wishlistData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.wishlistSessions.set(userId, {
        data: wishlistData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing wishlist session:', error);
      return false;
    }
  }

  async getWishlistSession(userId) {
    try {
      const redisData = await redisClient.getSession(`wishlist:${userId}`);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.wishlistSessions.get(userId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.wishlistSessions.delete(userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving wishlist session:', error);
      return null;
    }
  }

  async storeSearchSession(userId, searchData, ttl = 3600) { // 1 hour
    try {
      const redisSuccess = await redisClient.setSession(`search:${userId}`, searchData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.searchSessions.set(userId, {
        data: searchData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing search session:', error);
      return false;
    }
  }

  async getSearchSession(userId) {
    try {
      const redisData = await redisClient.getSession(`search:${userId}`);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.searchSessions.get(userId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.searchSessions.delete(userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving search session:', error);
      return null;
    }
  }

  async storeActivitySession(userId, activityData, ttl = 1800) { // 30 minutes
    try {
      const redisSuccess = await redisClient.setSession(`activity:${userId}`, activityData, ttl);
      if (redisSuccess) {
        return true;
      }
      
      this.memoryStore.activitySessions.set(userId, {
        data: activityData,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.error('Error storing activity session:', error);
      return false;
    }
  }

  async getActivitySession(userId) {
    try {
      const redisData = await redisClient.getSession(`activity:${userId}`);
      if (redisData) {
        return redisData;
      }
      
      const memoryData = this.memoryStore.activitySessions.get(userId);
      if (memoryData && memoryData.expires > Date.now()) {
        return memoryData.data;
      }
      
      if (memoryData) {
        this.memoryStore.activitySessions.delete(userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving activity session:', error);
      return null;
    }
  }

  // Legacy method compatibility
  async setUserSession(userId, userData, ttl = 86400) {
    return this.storeUserSession(userId, userData, ttl);
  }

  async setShopSession(shopId, shopData, ttl = 86400) {
    return this.storeShopSession(shopId, shopData, ttl);
  }

  async setTokenSession(token, tokenData, ttl = 86400) {
    return this.storeTokenSession(token, tokenData, ttl);
  }

  async invalidateUserSession(userId) {
    return this.deleteUserSession(userId);
  }

  async invalidateShopSession(shopId) {
    return this.deleteShopSession(shopId);
  }

  async invalidateTokenSession(token) {
    return this.deleteTokenSession(token);
  }

  async setUserCart(userId, cartItems, ttl = 604800) {
    return this.storeCartSession(userId, cartItems, ttl);
  }

  async getUserCart(userId) {
    return this.getCartSession(userId);
  }

  async setUserWishlist(userId, wishlistItems, ttl = 2592000) {
    return this.storeWishlistSession(userId, wishlistItems, ttl);
  }

  async getUserWishlist(userId) {
    return this.getWishlistSession(userId);
  }

  async setRecentSearches(userId, searches, ttl = 3600) {
    return this.storeSearchSession(userId, searches, ttl);
  }

  async getRecentSearches(userId) {
    return this.getSearchSession(userId);
  }

  async trackActivity(userId, activity, data) {
    const activityData = { activity, data, timestamp: new Date().toISOString() };
    return this.storeActivitySession(userId, activityData);
  }

  async getActivity(userId) {
    return this.getActivitySession(userId);
  }

  // Cleanup expired sessions from memory (fallback only)
  cleanupExpiredSessions() {
    const now = Date.now();
    
    for (const [key, value] of this.memoryStore.userSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.userSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.shopSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.shopSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.tokenSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.tokenSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.cartSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.cartSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.wishlistSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.wishlistSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.searchSessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.searchSessions.delete(key);
      }
    }
    
    for (const [key, value] of this.memoryStore.activitySessions.entries()) {
      if (value.expires <= now) {
        this.memoryStore.activitySessions.delete(key);
      }
    }
  }

  clearAllSessions() {
    // Clear memory store
    this.memoryStore.userSessions.clear();
    this.memoryStore.shopSessions.clear();
    this.memoryStore.tokenSessions.clear();
    this.memoryStore.cartSessions.clear();
    this.memoryStore.wishlistSessions.clear();
    this.memoryStore.searchSessions.clear();
    this.memoryStore.activitySessions.clear();
    
    console.log('All in-memory sessions cleared');
  }

  getSessionCount() {
    return (
      this.memoryStore.userSessions.size +
      this.memoryStore.shopSessions.size +
      this.memoryStore.tokenSessions.size +
      this.memoryStore.cartSessions.size +
      this.memoryStore.wishlistSessions.size +
      this.memoryStore.searchSessions.size +
      this.memoryStore.activitySessions.size
    );
  }
}

const sessionService = new SessionService();

// Run cleanup every 30 minutes for in-memory fallback
setInterval(() => {
  sessionService.cleanupExpiredSessions();
}, 30 * 60 * 1000);

module.exports = sessionService;
