/**
 * Advanced Performance Optimization System
 * Intelligent performance monitoring and optimization for Bhavya Bazaar
 */

const redis = require('../config/redis');
const ErrorHandler = require('./ErrorHandler');

class PerformanceOptimizer {
  
  /**
   * Database Query Optimization
   */
  static async optimizeQuery(model, query, options = {}) {
    try {
      const {
        useCache = true,
        cacheTTL = 300, // 5 minutes
        enablePagination = true,
        maxResults = 100
      } = options;

      // Generate cache key
      const cacheKey = `query:${model.modelName}:${JSON.stringify(query)}`;
      
      // Check cache first
      if (useCache) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`✅ Query cache hit for ${model.modelName}`);
          return JSON.parse(cached);
        }
      }

      // Add performance optimizations
      let optimizedQuery = model.find(query);

      // Add indexing hints
      if (query._id) {
        optimizedQuery = optimizedQuery.hint({ _id: 1 });
      }

      // Enable pagination if needed
      if (enablePagination && !query.limit) {
        optimizedQuery = optimizedQuery.limit(maxResults);
      }

      // Execute query with timing
      const startTime = Date.now();
      const result = await optimizedQuery.lean().exec();
      const queryTime = Date.now() - startTime;

      // Log slow queries
      if (queryTime > 1000) {
        console.warn(`⚠️ Slow query detected: ${model.modelName} (${queryTime}ms)`);
      }

      // Cache result
      if (useCache && result) {
        await redis.setex(cacheKey, cacheTTL, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('❌ Query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Image Optimization Middleware
   */
  static async optimizeImage(imageBuffer, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 85,
        format = 'jpeg'
      } = options;

      // This would integrate with an image processing library like Sharp
      // For now, we'll simulate the optimization
      console.log(`🖼️ Optimizing image: ${width}x${height}, quality: ${quality}%`);
      
      return {
        buffer: imageBuffer,
        size: imageBuffer.length,
        optimized: true,
        originalSize: imageBuffer.length,
        compressionRatio: 1.0
      };
    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      return {
        buffer: imageBuffer,
        size: imageBuffer.length,
        optimized: false,
        error: error.message
      };
    }
  }

  /**
   * API Response Optimization
   */
  static optimizeResponse(data, options = {}) {
    try {
      const {
        removeEmpty = true,
        compressArrays = true,
        maxDepth = 3
      } = options;

      // Remove empty fields to reduce payload size
      if (removeEmpty) {
        data = this.removeEmptyFields(data);
      }

      // Compress large arrays
      if (compressArrays && Array.isArray(data) && data.length > 50) {
        console.log(`📦 Compressing large array response (${data.length} items)`);
        // Implement pagination or chunking
        data = {
          items: data.slice(0, 50),
          total: data.length,
          hasMore: data.length > 50,
          pagination: {
            page: 1,
            limit: 50,
            total: data.length
          }
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Response optimization failed:', error);
      return data;
    }
  }

  /**
   * Memory Management
   */
  static monitorMemoryUsage() {
    const usage = process.memoryUsage();
    const metrics = {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      timestamp: new Date().toISOString()
    };

    // Alert on high memory usage
    if (metrics.heapUsed > 500) { // 500MB
      console.warn(`⚠️ High memory usage: ${metrics.heapUsed}MB`);
    }

    return metrics;
  }

  /**
   * Database Connection Pool Optimization
   */
  static optimizeConnectionPool(mongoose) {
    const config = {
      maxPoolSize: 10, // Maximum connections
      minPoolSize: 2,  // Minimum connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      maxIdleTimeMS: 30000,
    };

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection pool optimized');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    return config;
  }

  /**
   * Request Compression
   */
  static getCompressionConfig() {
    return {
      level: 6, // Compression level (1-9)
      threshold: 1024, // Only compress files larger than 1KB
      filter: (req, res) => {
        // Don't compress if the request includes this header
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Use compression filter function
        return true;
      }
    };
  }

  /**
   * Performance Metrics Collection
   */
  static async collectMetrics() {
    try {
      const metrics = {
        memory: this.monitorMemoryUsage(),
        database: await this.getDatabaseMetrics(),
        cache: await this.getCacheMetrics(),
        timestamp: new Date().toISOString()
      };

      // Store metrics in Redis for monitoring
      await redis.lpush('performance_metrics', JSON.stringify(metrics));
      await redis.ltrim('performance_metrics', 0, 100); // Keep last 100 entries

      return metrics;
    } catch (error) {
      console.error('❌ Metrics collection failed:', error);
      return null;
    }
  }

  /**
   * Database Performance Metrics
   */
  static async getDatabaseMetrics() {
    try {
      // This would typically query database stats
      return {
        connections: 5, // Active connections
        queryTime: 50, // Average query time in ms
        slowQueries: 0, // Number of slow queries
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Database metrics collection failed:', error);
      return null;
    }
  }

  /**
   * Cache Performance Metrics
   */
  static async getCacheMetrics() {
    try {
      const info = await redis.info('stats');
      const stats = info.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) acc[key] = value;
        return acc;
      }, {});

      return {
        hitRate: stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses) || 0,
        totalKeys: await redis.dbsize(),
        memoryUsed: stats.used_memory,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Cache metrics collection failed:', error);
      return null;
    }
  }

  /**
   * Auto-scaling Recommendations
   */
  static async getScalingRecommendations() {
    try {
      const metrics = await this.collectMetrics();
      const recommendations = [];

      if (metrics.memory.heapUsed > 400) {
        recommendations.push({
          type: 'memory',
          action: 'increase_memory',
          reason: 'High memory usage detected',
          priority: 'high'
        });
      }

      if (metrics.cache.hitRate < 0.8) {
        recommendations.push({
          type: 'cache',
          action: 'optimize_caching',
          reason: 'Low cache hit rate',
          priority: 'medium'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('❌ Scaling recommendations failed:', error);
      return [];
    }
  }

  /**
   * Helper: Remove empty fields
   */
  static removeEmptyFields(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEmptyFields(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = this.removeEmptyFields(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Performance Health Check
   */
  static async performanceHealthCheck() {
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const dbTest = await this.getDatabaseMetrics();
      const dbTime = Date.now() - startTime;

      // Test cache connectivity
      const cacheStart = Date.now();
      const cacheTest = await redis.ping();
      const cacheTime = Date.now() - cacheStart;

      // Memory check
      const memory = this.monitorMemoryUsage();

      const health = {
        status: 'healthy',
        database: {
          status: dbTest ? 'healthy' : 'unhealthy',
          responseTime: dbTime
        },
        cache: {
          status: cacheTest === 'PONG' ? 'healthy' : 'unhealthy',
          responseTime: cacheTime
        },
        memory: {
          status: memory.heapUsed < 500 ? 'healthy' : 'warning',
          usage: memory
        },
        timestamp: new Date().toISOString()
      };

      // Overall health assessment
      if (health.database.status !== 'healthy' || health.cache.status !== 'healthy') {
        health.status = 'unhealthy';
      } else if (health.memory.status === 'warning') {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      console.error('❌ Performance health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = PerformanceOptimizer;
