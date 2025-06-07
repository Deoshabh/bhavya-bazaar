const cacheService = require('../utils/cacheService');

/**
 * Middleware for caching GET requests with fallback handling
 * @param {number} ttl - Time to live in seconds
 * @param {Function} keyGenerator - Function to generate cache key from request
 */
const cacheMiddleware = (ttl = 900, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if Redis is available
    if (!global.redisAvailable) {
      console.log('⚠️ Redis unavailable, skipping cache');
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (keyGenerator && typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation
        const queryString = new URLSearchParams(req.query).toString();
        cacheKey = `${req.originalUrl}${queryString ? `?${queryString}` : ''}`;
      }

      // Try to get data from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        console.log(`🎯 Serving from cache: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      // If not in cache, continue to route handler
      // But override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Only cache successful responses if Redis is available
        if (res.statusCode === 200 && global.redisAvailable) {
          cacheService.set(cacheKey, data, ttl).catch(err => {
            console.error('Error caching response:', err);
          });
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Middleware for caching product listings
 */
const cacheProducts = (ttl = 900) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateProductKey({
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      shopId: req.query.shopId,
      search: req.query.keyword,
      sort: req.query.sort
    });
  });
};

/**
 * Middleware for caching shop data
 */
const cacheShop = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateShopKey(req.params.id || req.params.shopId);
  });
};

/**
 * Middleware for caching user data
 */
const cacheUser = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateUserKey(req.params.id || req.user?.id);
  });
};

/**
 * Middleware for invalidating cache on data changes with fallback handling
 * @param {string[]} patterns - Array of cache key patterns to invalidate
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Check if Redis is available
    if (!global.redisAvailable) {
      console.log('⚠️ Redis unavailable, skipping cache invalidation');
      return next();
    }

    // Store original json method
    const originalJson = res.json;
    
    res.json = async function(data) {
      // If operation was successful, invalidate cache
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          for (const pattern of patterns) {
            await cacheService.delPattern(pattern);
          }
        } catch (error) {
          console.error('Error invalidating cache:', error);
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Invalidate product-related cache
 */
const invalidateProductCache = () => {
  return invalidateCache([
    'products:*',
    'shop:*' // Shop cache might include product counts
  ]);
};

/**
 * Invalidate shop-related cache
 */
const invalidateShopCache = () => {
  return invalidateCache(['shop:*']);
};

/**
 * Invalidate user-related cache
 */
const invalidateUserCache = () => {
  return invalidateCache(['user:*']);
};

/**
 * Invalidate order-related cache
 */
const invalidateOrderCache = () => {
  return invalidateCache(['order:*']);
};

/**
 * Invalidate event-related cache
 */
const invalidateEventCache = () => {
  return invalidateCache(['event:*']);
};

/**
 * Invalidate conversation-related cache
 */
const invalidateConversationCache = () => {
  return invalidateCache(['conversation:*']);
};

/**
 * Invalidate message-related cache
 */
const invalidateMessageCache = () => {
  return invalidateCache(['message:*']);
};

// Cache warming is now handled by the dedicated CacheWarmupService

/**
 * Cache orders with TTL
 * @param {number} ttl - Time to live in seconds
 */
const cacheOrders = (ttl = 900) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateOrderKey({
      userId: req.params.userId,
      shopId: req.params.shopId,
      status: req.query.status,
      page: req.query.page
    });
  });
};

/**
 * Cache events with TTL
 * @param {number} ttl - Time to live in seconds
 */
const cacheEvents = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateEventKey({
      shopId: req.params.id,
      page: req.query.page,
      limit: req.query.limit
    });
  });
};

/**
 * Cache conversations with TTL
 * @param {number} ttl - Time to live in seconds
 */
const cacheConversations = (ttl = 600) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateConversationKey(req.params.id);
  });
};

/**
 * Cache messages with TTL
 * @param {number} ttl - Time to live in seconds
 */
const cacheMessages = (ttl = 300) => {
  return cacheMiddleware(ttl, (req) => {
    return cacheService.generateMessageKey(req.params.id);
  });
};

/**
 * Cache users with TTL
 * @param {number} ttl - Time to live in seconds
 */
const cacheUsers = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    return `users:all:${req.query.page || 1}:${req.query.limit || 10}`;
  });
};

module.exports = {
  cacheMiddleware,
  cacheProducts,
  cacheShop,
  cacheUser,
  invalidateCache,
  invalidateProductCache,
  invalidateShopCache,
  invalidateUserCache,
  invalidateOrderCache,
  invalidateEventCache,
  invalidateConversationCache,
  invalidateMessageCache,
  cacheOrders,
  cacheEvents,
  cacheConversations,
  cacheMessages,
  cacheUsers
};
