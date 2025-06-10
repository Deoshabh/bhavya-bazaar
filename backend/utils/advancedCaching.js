/**
 * Advanced Caching System for Bhavya Bazaar
 * Implements intelligent caching strategies for improved performance
 */

const redis = require('../config/redis');
const ErrorHandler = require('./ErrorHandler');

class AdvancedCaching {
  
  /**
   * Product Catalog Caching
   */
  static async cacheProductCatalog(products, options = {}) {
    try {
      const {
        category = 'all',
        ttl = 3600, // 1 hour default
        tags = []
      } = options;

      const cacheKey = `products:catalog:${category}`;
      const metadata = {
        cached_at: new Date().toISOString(),
        ttl,
        tags,
        count: products.length
      };

      // Store products with metadata
      const cacheData = {
        products,
        metadata
      };

      await redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
      
      // Store category tags for cache invalidation
      await redis.sadd('cache:product_categories', category);
      
      console.log(`✅ Cached ${products.length} products for category: ${category}`);
      return true;
    } catch (error) {
      console.error('❌ Product catalog caching failed:', error);
      return false;
    }
  }

  /**
   * Get Cached Product Catalog
   */
  static async getCachedProductCatalog(category = 'all') {
    try {
      const cacheKey = `products:catalog:${category}`;
      const cached = await redis.get(cacheKey);
      
      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      
      // Check if cache is stale (optional freshness check)
      const cacheAge = Date.now() - new Date(data.metadata.cached_at).getTime();
      const maxAge = data.metadata.ttl * 1000;
      
      if (cacheAge > maxAge) {
        console.log(`⚠️ Cache expired for category: ${category}`);
        await redis.del(cacheKey);
        return null;
      }

      console.log(`✅ Cache hit for category: ${category} (${data.metadata.count} products)`);
      return data.products;
    } catch (error) {
      console.error('❌ Product catalog cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Search Results Caching
   */
  static async cacheSearchResults(query, results, options = {}) {
    try {
      const {
        ttl = 1800, // 30 minutes for search results
        filters = {}
      } = options;

      // Create cache key from query and filters
      const filterString = Object.keys(filters).sort().map(key => `${key}:${filters[key]}`).join('|');
      const cacheKey = `search:${Buffer.from(query + filterString).toString('base64')}`;

      const cacheData = {
        query,
        filters,
        results,
        metadata: {
          cached_at: new Date().toISOString(),
          ttl,
          result_count: results.length
        }
      };

      await redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
      
      // Track search queries for analytics
      await redis.zincrby('analytics:search_queries', 1, query);
      
      console.log(`✅ Cached search results for query: "${query}" (${results.length} results)`);
      return true;
    } catch (error) {
      console.error('❌ Search results caching failed:', error);
      return false;
    }
  }

  /**
   * Get Cached Search Results
   */
  static async getCachedSearchResults(query, filters = {}) {
    try {
      const filterString = Object.keys(filters).sort().map(key => `${key}:${filters[key]}`).join('|');
      const cacheKey = `search:${Buffer.from(query + filterString).toString('base64')}`;
      
      const cached = await redis.get(cacheKey);
      
      if (!cached) {
        return null;
      }

      const data = JSON.parse(cached);
      console.log(`✅ Search cache hit for query: "${query}" (${data.metadata.result_count} results)`);
      return data.results;
    } catch (error) {
      console.error('❌ Search cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * User Session Optimization
   */
  static async optimizeUserSession(userId, sessionData) {
    try {
      const cacheKey = `session:optimized:${userId}`;
      
      // Store frequently accessed user data
      const optimizedData = {
        profile: {
          id: sessionData.id,
          name: sessionData.name,
          avatar: sessionData.avatar,
          role: sessionData.role
        },
        preferences: sessionData.preferences || {},
        cart_count: sessionData.cart_count || 0,
        wishlist_count: sessionData.wishlist_count || 0,
        last_activity: new Date().toISOString()
      };

      await redis.setex(cacheKey, 7200, JSON.stringify(optimizedData)); // 2 hours
      console.log(`✅ Optimized session cache for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Session optimization failed:', error);
      return false;
    }
  }

  /**
   * Rate Limiting Counters
   */
  static async incrementRateLimit(identifier, window = 3600, limit = 1000) {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      const remaining = Math.max(0, limit - current);
      const isLimited = current > limit;
      
      return {
        current,
        remaining,
        limit,
        reset_time: Date.now() + (window * 1000),
        is_limited: isLimited
      };
    } catch (error) {
      console.error('❌ Rate limiting failed:', error);
      return { current: 0, remaining: limit, limit, reset_time: Date.now() + (window * 1000), is_limited: false };
    }
  }

  /**
   * Cache Invalidation
   */
  static async invalidateProductCache(category = null) {
    try {
      if (category) {
        // Invalidate specific category
        const cacheKey = `products:catalog:${category}`;
        await redis.del(cacheKey);
        console.log(`✅ Invalidated product cache for category: ${category}`);
      } else {
        // Invalidate all product caches
        const categories = await redis.smembers('cache:product_categories');
        const keys = categories.map(cat => `products:catalog:${cat}`);
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`✅ Invalidated product cache for ${keys.length} categories`);
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error);
      return false;
    }
  }

  /**
   * Cache Health Check
   */
  static async getCacheHealth() {
    try {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      
      // Get cache statistics
      const productCategories = await redis.scard('cache:product_categories');
      const searchQueries = await redis.zcard('analytics:search_queries');
      
      return {
        status: 'healthy',
        memory_info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) acc[key] = value;
          return acc;
        }, {}),
        keyspace_info: keyspace,
        cache_stats: {
          product_categories: productCategories,
          search_queries: searchQueries
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Cache health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Warm Up Cache
   */
  static async warmUpCache() {
    try {
      console.log('🔥 Starting cache warm-up...');
      
      // This would typically be called during application startup
      // to pre-populate frequently accessed data
      
      // Example: Pre-cache popular product categories
      const popularCategories = ['electronics', 'clothing', 'books', 'home'];
      
      for (const category of popularCategories) {
        // In a real implementation, you'd fetch products from database
        // await this.cacheProductCatalog(products, { category, ttl: 7200 });
      }
      
      console.log('✅ Cache warm-up completed');
      return true;
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
      return false;
    }
  }
}

module.exports = AdvancedCaching;
