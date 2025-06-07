const redis = require('../config/redis');
const zlib = require('zlib');
const { promisify } = require('util');

const compress = promisify(zlib.gzip);
const decompress = promisify(zlib.gunzip);

class CacheService {
  constructor() {
    this.defaultTTL = {
      SHORT: 300,      // 5 minutes
      MEDIUM: 900,     // 15 minutes
      LONG: 3600,      // 1 hour
      VERY_LONG: 86400 // 24 hours
    };
    
    // Analytics tracking
    this.analytics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalResponseTime: 0,
      requestCount: 0
    };
    
    // Compression threshold (1KB)
    this.compressionThreshold = 1024;
  }

  /**
   * Track cache analytics
   */
  trackHit() {
    this.analytics.hits++;
    this.analytics.requestCount++;
  }

  trackMiss() {
    this.analytics.misses++;
    this.analytics.requestCount++;
  }

  trackSet() {
    this.analytics.sets++;
  }

  trackDelete() {
    this.analytics.deletes++;
  }

  trackError() {
    this.analytics.errors++;
  }

  trackResponseTime(startTime) {
    const responseTime = Date.now() - startTime;
    this.analytics.totalResponseTime += responseTime;
    return responseTime;
  }

  /**
   * Get cache analytics
   */
  getAnalytics() {
    const hitRate = this.analytics.requestCount > 0 
      ? (this.analytics.hits / this.analytics.requestCount * 100).toFixed(2)
      : 0;

    const missRate = this.analytics.requestCount > 0
      ? (this.analytics.misses / this.analytics.requestCount * 100).toFixed(2)
      : 0;

    const avgResponseTime = this.analytics.requestCount > 0
      ? (this.analytics.totalResponseTime / this.analytics.requestCount).toFixed(2)
      : 0;

    return {
      ...this.analytics,
      hitRate: `${hitRate}%`,
      missRate: `${missRate}%`,
      avgResponseTime: `${avgResponseTime}ms`
    };
  }

  /**
   * Reset analytics
   */
  resetAnalytics() {
    this.analytics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalResponseTime: 0,
      requestCount: 0
    };
  }

  /**
   * Compress data if it exceeds threshold
   */
  async compressData(data) {
    const serialized = JSON.stringify(data);
    if (serialized.length > this.compressionThreshold) {
      const compressed = await compress(serialized);
      return {
        data: compressed.toString('base64'),
        compressed: true,
        originalSize: serialized.length,
        compressedSize: compressed.length
      };
    }
    return {
      data: serialized,
      compressed: false,
      originalSize: serialized.length,
      compressedSize: serialized.length
    };
  }

  /**
   * Decompress data if compressed
   */
  async decompressData(cachedData) {
    if (typeof cachedData === 'string') {
      // Legacy uncompressed data
      return JSON.parse(cachedData);
    }
    
    if (cachedData.compressed) {
      const buffer = Buffer.from(cachedData.data, 'base64');
      const decompressed = await decompress(buffer);
      return JSON.parse(decompressed.toString());
    }
    
    return JSON.parse(cachedData.data);
  }

  /**
   * Set data in cache with compression and analytics
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @param {boolean} enableCompression - Enable compression for this data
   */
  async set(key, data, ttl = this.defaultTTL.MEDIUM, enableCompression = true) {
    const startTime = Date.now();
    
    try {
      let cacheData;
      
      if (enableCompression) {
        cacheData = await this.compressData(data);
      } else {
        cacheData = {
          data: JSON.stringify(data),
          compressed: false,
          originalSize: JSON.stringify(data).length,
          compressedSize: JSON.stringify(data).length
        };
      }
      
      await redis.setex(key, ttl, JSON.stringify(cacheData));
      
      this.trackSet();
      this.trackResponseTime(startTime);
      
      console.log(`📦 Cached data with key: ${key} (${cacheData.compressed ? 'compressed' : 'uncompressed'})`);
      if (cacheData.compressed) {
        console.log(`🗜️ Compression ratio: ${((1 - cacheData.compressedSize / cacheData.originalSize) * 100).toFixed(1)}%`);
      }
      
      return true;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error setting cache for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Get data from cache with decompression and analytics
   * @param {string} key - Cache key
   */
  async get(key) {
    const startTime = Date.now();
    
    try {
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        this.trackHit();
        this.trackResponseTime(startTime);
        
        console.log(`🎯 Cache hit for key: ${key}`);
        
        const parsedData = JSON.parse(cachedData);
        const result = await this.decompressData(parsedData);
        
        return result;
      }
      
      this.trackMiss();
      this.trackResponseTime(startTime);
      console.log(`❌ Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error getting cache for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Delete data from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      const result = await redis.del(key);
      this.trackDelete();
      console.log(`🗑️ Deleted cache key: ${key}`);
      return result;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error deleting cache for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match keys
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const result = await redis.del(...keys);
        this.trackDelete();
        console.log(`🗑️ Deleted ${result} cache keys matching pattern: ${pattern}`);
        return result;
      }
      return 0;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error deleting cache pattern ${pattern}:`, error.message);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      return await redis.exists(key);
    } catch (error) {
      this.trackError();
      console.error(`❌ Error checking cache existence for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Set TTL for existing key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    try {
      return await redis.expire(key, ttl);
    } catch (error) {
      this.trackError();
      console.error(`❌ Error setting TTL for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Increment a numeric value in cache
   * @param {string} key - Cache key
   * @param {number} increment - Amount to increment (default: 1)
   */
  async incr(key, increment = 1) {
    try {
      if (increment === 1) {
        return await redis.incr(key);
      } else {
        return await redis.incrby(key, increment);
      }
    } catch (error) {
      this.trackError();
      console.error(`❌ Error incrementing cache key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of cache keys
   */
  async mget(keys) {
    try {
      const values = await redis.mget(...keys);
      const result = {};
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        }
      });
      return result;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error getting multiple cache keys:`, error.message);
      return {};
    }
  }

  /**
   * Set multiple key-value pairs
   * @param {Object} data - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   */
  async mset(data, ttl = this.defaultTTL.MEDIUM) {
    try {
      const pipeline = redis.pipeline();
      Object.entries(data).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      this.trackError();
      console.error(`❌ Error setting multiple cache keys:`, error.message);
      return false;
    }
  }

  /**
   * Generate cache key for products
   * @param {Object} params - Parameters for key generation
   */
  generateProductKey(params = {}) {
    const { page = 1, limit = 10, category, shopId, search, sort } = params;
    const keyParts = ['products'];
    
    if (category) keyParts.push(`cat:${category}`);
    if (shopId) keyParts.push(`shop:${shopId}`);
    if (search) keyParts.push(`search:${search}`);
    if (sort) keyParts.push(`sort:${sort}`);
    
    keyParts.push(`page:${page}`, `limit:${limit}`);
    
    return keyParts.join(':');
  }

  /**
   * Generate cache key for shop
   * @param {string} shopId - Shop ID
   */
  generateShopKey(shopId) {
    return `shop:${shopId}`;
  }

  /**
   * Generate cache key for user
   * @param {string} userId - User ID
   */
  generateUserKey(userId) {
    return `user:${userId}`;
  }

  /**
   * Generate cache key for orders
   * @param {Object} params - Order parameters
   */
  generateOrderKey(params) {
    const { userId, shopId, status, page = 1 } = params;
    const keyParts = ['order'];
    
    if (userId) keyParts.push(`user:${userId}`);
    if (shopId) keyParts.push(`shop:${shopId}`);
    if (status) keyParts.push(`status:${status}`);
    keyParts.push(`page:${page}`);
    
    return keyParts.join(':');
  }

  /**
   * Generate cache key for events
   * @param {Object} params - Event parameters
   */
  generateEventKey(params) {
    const { shopId, page = 1, limit = 10 } = params;
    const keyParts = ['event'];
    
    if (shopId) keyParts.push(`shop:${shopId}`);
    keyParts.push(`page:${page}`, `limit:${limit}`);
    
    return keyParts.join(':');
  }

  /**
   * Generate cache key for conversations
   * @param {string} userId - User ID
   */
  generateConversationKey(userId) {
    return `conversation:user:${userId}`;
  }

  /**
   * Generate cache key for messages
   * @param {string} conversationId - Conversation ID
   */
  generateMessageKey(conversationId) {
    return `message:conversation:${conversationId}`;
  }

  /**
   * Generate cache key for popular products
   */
  generatePopularProductsKey() {
    return 'products:popular';
  }

  /**
   * Generate cache key for trending products
   */
  generateTrendingProductsKey() {
    return 'products:trending';
  }

  /**
   * Generate cache key for category products
   * @param {string} category - Category name
   */
  generateCategoryKey(category) {
    return `products:category:${category}`;
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    try {
      await redis.flushdb();
      console.log('🗑️ Cleared all cache');
      return true;
    } catch (error) {
      console.error('❌ Error clearing all cache:', error.message);
      return false;
    }
  }
  /**
   * Get cache statistics including analytics
   */
  async getStats() {
    try {
      const info = await redis.info('memory');
      const dbSize = await redis.dbsize();
      
      return {
        totalKeys: dbSize,
        analytics: this.getAnalytics(),
        memoryInfo: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {}),
        compressionThreshold: this.compressionThreshold
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error.message);
      return null;
    }
  }

  /**
   * Get detailed performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const stats = await this.getStats();
      const analytics = this.getAnalytics();
      
      return {
        ...analytics,
        memoryUsage: stats.memoryInfo.used_memory_human || 'N/A',
        totalKeys: stats.totalKeys,
        compressionEnabled: true,
        compressionThreshold: `${this.compressionThreshold} bytes`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting performance metrics:', error.message);
      return null;
    }
  }
}

module.exports = new CacheService();
