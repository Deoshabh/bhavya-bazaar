const redis = require('./redisClient');

/**
 * Redis Health Monitoring Service
 * Provides comprehensive health checks and performance metrics for Redis
 */
class RedisHealthService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      responseTimeSum: 0,
      lastHealthCheck: null,
      connectionStatus: 'unknown'
    };
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    // Health check every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
    
    // Initial health check
    setTimeout(() => this.performHealthCheck(), 1000);
  }

  /**
   * Perform comprehensive Redis health check
   */
  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const pingResult = await redis.ping();
      
      // Test read/write operations
      const testKey = 'health:test:' + Date.now();
      const testValue = { timestamp: Date.now(), test: true };
      
      await redis.set(testKey, JSON.stringify(testValue), 'EX', 10);
      const retrievedValue = await redis.get(testKey);
      await redis.del(testKey);
      
      // Test if data integrity is maintained
      const isDataIntact = JSON.parse(retrievedValue).timestamp === testValue.timestamp;
      
      // Get Redis info
      const info = await redis.info();
      const memory = await redis.info('memory');
      
      const responseTime = Date.now() - startTime;
      
      this.metrics.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        responseTime,
        ping: pingResult,
        dataIntegrity: isDataIntact,
        info: this.parseRedisInfo(info),
        memory: this.parseRedisInfo(memory)
      };
      
      this.metrics.connectionStatus = 'connected';
      
      console.log(`✅ Redis Health Check Passed (${responseTime}ms)`);
      
    } catch (error) {
      this.metrics.errors++;
      this.metrics.connectionStatus = 'error';
      this.metrics.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      };
      
      console.error('❌ Redis Health Check Failed:', error.message);
    }
  }

  /**
   * Parse Redis INFO command output
   */
  parseRedisInfo(info) {
    const parsed = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    }
    
    return parsed;
  }

  /**
   * Record cache hit
   */
  recordCacheHit(responseTime = 0) {
    this.metrics.totalRequests++;
    this.metrics.cacheHits++;
    this.metrics.responseTimeSum += responseTime;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(responseTime = 0) {
    this.metrics.totalRequests++;
    this.metrics.cacheMisses++;
    this.metrics.responseTimeSum += responseTime;
  }

  /**
   * Record cache error
   */
  recordCacheError() {
    this.metrics.errors++;
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
      
    const avgResponseTime = this.metrics.totalRequests > 0
      ? (this.metrics.responseTimeSum / this.metrics.totalRequests).toFixed(2)
      : 0;

    return {
      performance: {
        totalRequests: this.metrics.totalRequests,
        cacheHits: this.metrics.cacheHits,
        cacheMisses: this.metrics.cacheMisses,
        hitRate: `${hitRate}%`,
        averageResponseTime: `${avgResponseTime}ms`,
        errors: this.metrics.errors
      },
      health: this.metrics.lastHealthCheck,
      connection: {
        status: this.metrics.connectionStatus,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics() {
    this.metrics.totalRequests = 0;
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
    this.metrics.errors = 0;
    this.metrics.responseTimeSum = 0;
    console.log('🔄 Redis metrics reset');
  }

  /**
   * Get Redis configuration and status
   */
  async getRedisStatus() {
    try {
      const info = await redis.info();
      const config = await redis.config('GET', '*');
      const memory = await redis.info('memory');
      const clients = await redis.info('clients');
      
      return {
        info: this.parseRedisInfo(info),
        memory: this.parseRedisInfo(memory),
        clients: this.parseRedisInfo(clients),
        config: this.parseRedisConfig(config),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get Redis status: ${error.message}`);
    }
  }

  /**
   * Parse Redis CONFIG command output
   */
  parseRedisConfig(config) {
    const parsed = {};
    for (let i = 0; i < config.length; i += 2) {
      parsed[config[i]] = config[i + 1];
    }
    return parsed;
  }

  /**
   * Test Redis performance
   */
  async performanceTest() {
    console.log('🧪 Starting Redis performance test...');
    
    const testData = {
      simple: 'simple string value',
      object: { name: 'test', data: [1, 2, 3, 4, 5], timestamp: Date.now() },
      array: new Array(100).fill(0).map((_, i) => ({ id: i, value: `item_${i}` }))
    };

    const results = {
      operations: [],
      summary: {}
    };

    // Test SET operations
    for (const [type, data] of Object.entries(testData)) {
      const key = `perf_test_${type}_${Date.now()}`;
      const startTime = Date.now();
      
      try {
        await redis.set(key, JSON.stringify(data), 'EX', 60);
        const setTime = Date.now() - startTime;
        
        const getStartTime = Date.now();
        const retrieved = await redis.get(key);
        const getTime = Date.now() - getStartTime;
        
        await redis.del(key);
        
        results.operations.push({
          type,
          setTime,
          getTime,
          dataSize: JSON.stringify(data).length,
          success: JSON.parse(retrieved) !== null
        });
        
      } catch (error) {
        results.operations.push({
          type,
          error: error.message,
          success: false
        });
      }
    }

    // Calculate summary
    const successful = results.operations.filter(op => op.success);
    results.summary = {
      totalOperations: results.operations.length,
      successfulOperations: successful.length,
      averageSetTime: successful.reduce((sum, op) => sum + op.setTime, 0) / successful.length,
      averageGetTime: successful.reduce((sum, op) => sum + op.getTime, 0) / successful.length,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Redis performance test completed');
    return results;
  }
}

// Create singleton instance
const redisHealthService = new RedisHealthService();

module.exports = redisHealthService;
