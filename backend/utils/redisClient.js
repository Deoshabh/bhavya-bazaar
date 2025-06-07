const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('⚠️ Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Test the connection
      await this.client.ping();
      
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return null;
    }
  }

  getClient() {
    return this.client;
  }

  isRedisConnected() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Session management methods
  async setSession(key, data, ttl = 86400) {
    if (!this.isRedisConnected()) return false;
    try {
      await this.client.setex(`session:${key}`, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Redis setSession error:', error);
      return false;
    }
  }

  async getSession(key) {
    if (!this.isRedisConnected()) return null;
    try {
      const data = await this.client.get(`session:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getSession error:', error);
      return null;
    }
  }

  async deleteSession(key) {
    if (!this.isRedisConnected()) return false;
    try {
      await this.client.del(`session:${key}`);
      return true;
    } catch (error) {
      console.error('Redis deleteSession error:', error);
      return false;
    }
  }

  // Token blacklist methods
  async blacklistToken(token, ttl = 86400) {
    if (!this.isRedisConnected()) return false;
    try {
      await this.client.setex(`blacklist:${token}`, ttl, 'true');
      return true;
    } catch (error) {
      console.error('Redis blacklistToken error:', error);
      return false;
    }
  }

  async isTokenBlacklisted(token) {
    if (!this.isRedisConnected()) return false;
    try {
      const result = await this.client.get(`blacklist:${token}`);
      return result === 'true';
    } catch (error) {
      console.error('Redis isTokenBlacklisted error:', error);
      return false;
    }
  }

  // Rate limiting methods
  async incrementRateLimit(key, windowMs, maxRequests) {
    if (!this.isRedisConnected()) return { allowed: true, remaining: maxRequests };
    
    try {
      const multi = this.client.multi();
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const rateLimitKey = `rate_limit:${key}:${window}`;
      
      multi.incr(rateLimitKey);
      multi.expire(rateLimitKey, Math.ceil(windowMs / 1000));
      
      const results = await multi.exec();
      const count = results[0][1];
      
      return {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetTime: (window + 1) * windowMs
      };
    } catch (error) {
      console.error('Redis incrementRateLimit error:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }

  // Cart persistence methods
  async setCart(userId, cart, ttl = 604800) { // 7 days
    if (!this.isRedisConnected()) return false;
    try {
      await this.client.setex(`cart:${userId}`, ttl, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Redis setCart error:', error);
      return false;
    }
  }

  async getCart(userId) {
    if (!this.isRedisConnected()) return null;
    try {
      const cart = await this.client.get(`cart:${userId}`);
      return cart ? JSON.parse(cart) : null;
    } catch (error) {
      console.error('Redis getCart error:', error);
      return null;
    }
  }

  async deleteCart(userId) {
    if (!this.isRedisConnected()) return false;
    try {
      await this.client.del(`cart:${userId}`);
      return true;
    } catch (error) {
      console.error('Redis deleteCart error:', error);
      return false;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;
