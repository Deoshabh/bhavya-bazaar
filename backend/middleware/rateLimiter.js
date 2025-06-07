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
      const redisKey = this.prefix + key;
      await redisClient.client.decr(redisKey);
    } catch (error) {
      console.error('Redis rate limiter decrement error:', error);
    }
  }

  async resetKey(key) {
    try {
      const redisKey = this.prefix + key;
      await redisClient.client.del(redisKey);
    } catch (error) {
      console.error('Redis rate limiter reset error:', error);
    }
  }
}

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient.isConnected() ? new RedisStore({
    prefix: 'api_limit:',
    windowMs: 15 * 60 * 1000
  }) : undefined
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  store: redisClient.isConnected() ? new RedisStore({
    prefix: 'auth_limit:',
    windowMs: 15 * 60 * 1000
  }) : undefined
});

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
  store: redisClient.isConnected() ? new RedisStore({
    prefix: 'password_reset_limit:',
    windowMs: 60 * 60 * 1000
  }) : undefined
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
  store: redisClient.isConnected() ? new RedisStore({
    prefix: 'upload_limit:',
    windowMs: 60 * 1000
  }) : undefined
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
  store: redisClient.isConnected() ? new RedisStore({
    prefix: 'search_limit:',
    windowMs: 60 * 1000
  }) : undefined
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  RedisStore
};
