const rateLimit = require('express-rate-limit');
const redisClient = require('../utils/redisClient');

/**
 * Redis-backed rate limiter store
 */
class RedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || 'rl:';
    this.windowMs = options.windowMs || 60000; // 1 minute default
  }
  async increment(key) {
    try {
      // Check if Redis client is available and connected
      if (!redisClient || !redisClient.client || typeof redisClient.isRedisConnected !== 'function' || !redisClient.isRedisConnected()) {
        console.warn('Redis not available in rate limiter, allowing request');
        return {
          totalHits: 1,
          remainingPoints: null,
          msBeforeNext: null,
          isFirstInWindow: true
        };
      }

      const redisKey = this.prefix + key;
      const multi = redisClient.client.multi();
      
      multi.incr(redisKey);
      multi.expire(redisKey, Math.ceil(this.windowMs / 1000));
      
      const results = await multi.exec();
      const hits = results[0][1];
      
      return {
        totalHits: hits,
        remainingPoints: null,
        msBeforeNext: null,
        isFirstInWindow: hits === 1
      };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback: allow the request if Redis fails
      return {
        totalHits: 1,
        remainingPoints: null,
        msBeforeNext: null,
        isFirstInWindow: true
      };
    }
  }
  async decrement(key) {
    try {
      if (!redisClient || !redisClient.client || typeof redisClient.isRedisConnected !== 'function' || !redisClient.isRedisConnected()) {
        return; // Silently fail if Redis not available
      }
      
      const redisKey = this.prefix + key;
      await redisClient.client.decr(redisKey);
    } catch (error) {
      console.error('Redis rate limiter decrement error:', error);
    }
  }

  async resetKey(key) {
    try {
      if (!redisClient || !redisClient.client || typeof redisClient.isRedisConnected !== 'function' || !redisClient.isRedisConnected()) {
        return; // Silently fail if Redis not available
      }
      
      const redisKey = this.prefix + key;
      await redisClient.client.del(redisKey);
    } catch (error) {
      console.error('Redis rate limiter reset error:', error);
    }
  }
}

/**
 * Check if Redis is available and connected
 */
function isRedisAvailable() {
  try {
    return redisClient && 
           redisClient.client &&
           typeof redisClient.isRedisConnected === 'function' && 
           redisClient.isRedisConnected();
  } catch (error) {
    console.warn('Redis availability check failed:', error.message);
    return false;
  }
}

/**
 * Get client IP configuration for rate limiting
 * This function determines how to extract the real client IP
 * while preventing IP spoofing attacks
 */
function getClientIpConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, use a more secure IP extraction
    return {
      // Custom key generator that validates proxy headers
      keyGenerator: (req) => {
        // First check if we have trusted proxy configuration
        const trustedProxies = process.env.TRUSTED_PROXIES;
        
        if (trustedProxies) {
          // We have trusted proxies, can use forwarded IP
          return req.ip || req.connection.remoteAddress;
        } else {
          // No trusted proxies configured, use direct connection IP only
          return req.connection.remoteAddress || req.socket.remoteAddress;
        }
      }
    };
  } else {
    // In development, use default behavior
    return {};
  }
}

/**
 * General API rate limiter
 */
let apiLimiter;
try {
  const ipConfig = getClientIpConfig();
  apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...ipConfig,
    // Use memory store if Redis is not available
    ...(isRedisAvailable() ? {
      store: new RedisStore({
        prefix: 'api_limit:',
        windowMs: 15 * 60 * 1000
      })
    } : {})
  });
} catch (error) {
  console.error('Failed to initialize apiLimiter, using fallback:', error.message);
  // Fallback rate limiter with default memory store
  apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}

/**
 * Strict rate limiter for authentication endpoints
 */
let authLimiter;
try {
  const ipConfig = getClientIpConfig();
  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login attempts per windowMs (increased from 5)
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    ...ipConfig,
    // Use memory store if Redis is not available
    ...(isRedisAvailable() ? {
      store: new RedisStore({
        prefix: 'auth_limit:',
        windowMs: 15 * 60 * 1000
      })
    } : {})
  });
} catch (error) {
  console.error('Failed to initialize authLimiter, using fallback:', error.message);  // Fallback rate limiter with default memory store
  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // increased from 5 to 20
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  });
}

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...getClientIpConfig(),
  // Use memory store if Redis is not available
  ...(isRedisAvailable() ? {
    store: new RedisStore({
      prefix: 'password_reset_limit:',
      windowMs: 60 * 60 * 1000
    })
  } : {})
});

/**
 * File upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 uploads per minute
  message: {
    error: 'Too many upload attempts, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...getClientIpConfig(),
  // Use memory store if Redis is not available
  ...(isRedisAvailable() ? {
    store: new RedisStore({
      prefix: 'upload_limit:',
      windowMs: 60 * 1000
    })
  } : {})
});

/**
 * Search rate limiter
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 searches per minute
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...getClientIpConfig(),
  // Use memory store if Redis is not available
  ...(isRedisAvailable() ? {
    store: new RedisStore({
      prefix: 'search_limit:',
      windowMs: 60 * 1000
    })
  } : {})
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  RedisStore
};
