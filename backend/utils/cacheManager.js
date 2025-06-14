/**
 * Enhanced Redis Caching System
 * Provides comprehensive caching strategies for improved performance
 */

const redisClient = require('./redisClient');

class CacheManager {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.longTTL = 3600; // 1 hour
    this.shortTTL = 60; // 1 minute
  }

  // Helper method to generate cache keys
  generateKey(type, identifier, suffix = '') {
    return `bhavya:${type}:${identifier}${suffix ? ':' + suffix : ''}`;
  }  // Generic get method with error handling
  async get(key) {
    try {
      if (!redisClient.isRedisConnected()) {
        return null;
      }
      const client = redisClient.getClient();
      const result = await client.get(key);
      if (result) {
        return JSON.parse(result);
      }
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }
  // Generic set method with error handling
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!redisClient.isRedisConnected()) {
        return false;
      }
      const client = redisClient.getClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }
  // Generic delete method
  async del(key) {
    try {
      if (!redisClient.isRedisConnected()) {
        return false;
      }
      const client = redisClient.getClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }
  // Delete multiple keys with pattern
  async deletePattern(pattern) {
    try {
      if (!redisClient.isRedisConnected()) {
        return 0;
      }
      const client = redisClient.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache pattern delete error for ${pattern}:`, error.message);
      return 0;
    }
  }

  // Product caching methods
  async getProduct(productId) {
    const key = this.generateKey('product', productId);
    return await this.get(key);
  }

  async setProduct(productId, productData) {
    const key = this.generateKey('product', productId);
    return await this.set(key, productData, this.longTTL);
  }

  async invalidateProduct(productId) {
    const key = this.generateKey('product', productId);
    return await this.del(key);
  }

  // Category products caching
  async getCategoryProducts(category, page = 1) {
    const key = this.generateKey('category', category, `page_${page}`);
    return await this.get(key);
  }

  async setCategoryProducts(category, page, products) {
    const key = this.generateKey('category', category, `page_${page}`);
    return await this.set(key, products, this.defaultTTL);
  }

  async invalidateCategoryProducts(category) {
    const pattern = this.generateKey('category', category, '*');
    return await this.deletePattern(pattern);
  }

  // Search results caching
  async getSearchResults(query, filters = {}) {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('_');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.get(key);
  }

  async setSearchResults(query, filters, results) {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('_');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.set(key, results, this.shortTTL);
  }

  // User session caching (enhanced)
  async getUserSession(userId) {
    const key = this.generateKey('user_session', userId);
    return await this.get(key);
  }

  async setUserSession(userId, sessionData) {
    const key = this.generateKey('user_session', userId);
    return await this.set(key, sessionData, this.longTTL);
  }

  async invalidateUserSession(userId) {
    const key = this.generateKey('user_session', userId);
    return await this.del(key);
  }

  // Cart caching (enhanced)
  async getCart(identifier, isGuest = false) {
    const type = isGuest ? 'guest_cart' : 'user_cart';
    const key = this.generateKey(type, identifier);
    return await this.get(key);
  }

  async setCart(identifier, cartData, isGuest = false) {
    const type = isGuest ? 'guest_cart' : 'user_cart';
    const key = this.generateKey(type, identifier);
    const ttl = isGuest ? this.defaultTTL : this.longTTL;
    return await this.set(key, cartData, ttl);
  }

  async invalidateCart(identifier, isGuest = false) {
    const type = isGuest ? 'guest_cart' : 'user_cart';
    const key = this.generateKey(type, identifier);
    return await this.del(key);
  }

  // Featured products caching
  async getFeaturedProducts() {
    const key = this.generateKey('featured', 'products');
    return await this.get(key);
  }

  async setFeaturedProducts(products) {
    const key = this.generateKey('featured', 'products');
    return await this.set(key, products, this.longTTL);
  }

  // Best selling products caching
  async getBestSellingProducts(limit = 10) {
    const key = this.generateKey('bestselling', `top_${limit}`);
    return await this.get(key);
  }

  async setBestSellingProducts(products, limit = 10) {
    const key = this.generateKey('bestselling', `top_${limit}`);
    return await this.set(key, products, this.longTTL);
  }

  // Shop/seller caching
  async getShop(shopId) {
    const key = this.generateKey('shop', shopId);
    return await this.get(key);
  }

  async setShop(shopId, shopData) {
    const key = this.generateKey('shop', shopId);
    return await this.set(key, shopData, this.longTTL);
  }

  async invalidateShop(shopId) {
    const key = this.generateKey('shop', shopId);
    return await this.del(key);
  }

  // Analytics caching
  async getAnalytics(type, identifier, period = 'daily') {
    const key = this.generateKey('analytics', `${type}_${identifier}`, period);
    return await this.get(key);
  }

  async setAnalytics(type, identifier, period, data) {
    const key = this.generateKey('analytics', `${type}_${identifier}`, period);
    return await this.set(key, data, this.defaultTTL);
  }  // Rate limiting helpers
  async incrementRateLimit(identifier, window = 3600) {
    try {
      if (!redisClient.isRedisConnected()) {
        return 0;
      }
      const client = redisClient.getClient();
      const key = this.generateKey('rate_limit', identifier);
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, window);
      }
      return current;
    } catch (error) {
      console.error(`Rate limit increment error for ${identifier}:`, error.message);
      return 0;
    }
  }
  async getRateLimit(identifier) {
    try {
      if (!redisClient.isRedisConnected()) {
        return 0;
      }
      const client = redisClient.getClient();
      const key = this.generateKey('rate_limit', identifier);
      const count = await client.get(key);
      return parseInt(count) || 0;
    } catch (error) {
      console.error(`Rate limit get error for ${identifier}:`, error.message);
      return 0;
    }
  }

  // Cache warming methods
  async warmCache() {
    console.log('🔥 Starting cache warming process...');
    
    try {
      // Warm popular products cache
      const Product = require('../model/product');
      const popularProducts = await Product.find({ sold_out: { $gte: 10 } })
        .sort({ sold_out: -1 })
        .limit(50)
        .lean();
      
      for (const product of popularProducts) {
        await this.setProduct(product._id, product);
      }
      
      console.log(`✅ Warmed cache for ${popularProducts.length} popular products`);
      
      // Warm featured products cache
      const featuredProducts = await Product.find({ featured: true }).limit(20).lean();
      await this.setFeaturedProducts(featuredProducts);
      console.log(`✅ Warmed featured products cache`);
      
      // Warm best selling products cache
      const bestSelling = await Product.find()
        .sort({ sold_out: -1 })
        .limit(20)
        .lean();
      await this.setBestSellingProducts(bestSelling);
      console.log(`✅ Warmed best selling products cache`);
      
    } catch (error) {
      console.error('❌ Cache warming failed:', error.message);
    }
  }  // Cache statistics
  async getCacheStats() {
    try {
      if (!redisClient.isRedisConnected()) {
        return {
          error: 'Redis not connected',
          timestamp: new Date().toISOString()
        };
      }
      const client = redisClient.getClient();
      const info = await client.info('memory');
      const keys = await client.dbsize();
      
      return {
        totalKeys: keys,
        memoryUsage: info,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return {
        error: 'Unable to fetch cache statistics',
        timestamp: new Date().toISOString()
      };
    }
  }
  // Health check
  async healthCheck() {
    try {
      if (!redisClient.isRedisConnected()) {
        return {
          status: 'unhealthy',
          error: 'Redis not connected',
          timestamp: new Date().toISOString()
        };
      }
      const client = redisClient.getClient();
      const start = Date.now();
      await client.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Warm cache on startup (with delay to allow app to fully start)
setTimeout(() => {
  cacheManager.warmCache();
}, 30000); // 30 seconds delay

module.exports = cacheManager;
