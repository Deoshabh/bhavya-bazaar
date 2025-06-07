const Redis = require("ioredis");

/**
 * Production Redis Configuration
 * Optimized for high availability and performance
 */
const createProductionRedisClient = () => {
  const config = {
    // Connection settings
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0,
    
    // Connection pool settings
    family: 4, // 4 (IPv4) or 6 (IPv6)
    keepAlive: true,
    
    // Retry and reconnection settings
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    
    // Connection timeout
    connectTimeout: 10000,
    commandTimeout: 5000,
    
    // Lazy connection
    lazyConnect: true,
    
    // Retry strategy
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    
    // Reconnect on error
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    
    // Memory optimization
    maxMemoryPolicy: 'allkeys-lru',
    
    // Compression
    compression: 'gzip',
    
    // Key prefix for multi-tenant environments
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'bhavya_bazaar:',
    
    // Health check interval
    healthCheckInterval: 30000,
  };

  // Redis Cluster configuration (if using cluster)
  if (process.env.REDIS_CLUSTER_ENABLED === 'true') {
    const clusterNodes = process.env.REDIS_CLUSTER_NODES 
      ? process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
          const [host, port] = node.trim().split(':');
          return { host, port: parseInt(port) || 6379 };
        })
      : [{ host: config.host, port: config.port }];

    return new Redis.Cluster(clusterNodes, {
      redisOptions: {
        password: config.password,
        ...config
      },
      clusterRetryDelayOnFailover: 100,
      clusterRetryDelayOnClusterDown: 300,
      clusterMaxRedirections: 6,
      scaleReads: 'slave',
      enableOfflineQueue: false,
    });
  }

  // Redis Sentinel configuration (if using sentinel)
  if (process.env.REDIS_SENTINEL_ENABLED === 'true') {
    const sentinels = process.env.REDIS_SENTINELS
      ? process.env.REDIS_SENTINELS.split(',').map(sentinel => {
          const [host, port] = sentinel.trim().split(':');
          return { host, port: parseInt(port) || 26379 };
        })
      : [{ host: 'localhost', port: 26379 }];

    return new Redis({
      sentinels,
      name: process.env.REDIS_SENTINEL_MASTER_NAME || 'mymaster',
      password: config.password,
      ...config,
      sentinelRetryDelayOnFailover: 100,
      enableOfflineQueue: false,
    });
  }

  // Standard Redis configuration
  return new Redis(config);
};

// Create Redis client
const redis = createProductionRedisClient();

// Enhanced error handling for production
redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  
  // Alert monitoring system in production
  if (process.env.NODE_ENV === 'production') {
    // Send alert to monitoring service
    // Example: Sentry, DataDog, New Relic, etc.
    console.error('🚨 PRODUCTION ALERT: Redis connection failed', {
      error: err.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  }
});

redis.on('connect', () => {
  console.log('🔄 Redis connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for production');
});

redis.on('reconnecting', (ms) => {
  console.log(`🔄 Redis reconnecting in ${ms}ms`);
});

redis.on('end', () => {
  console.log('🔴 Redis connection ended');
});

// Health monitoring
const startHealthMonitoring = () => {
  setInterval(async () => {
    try {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;
      
      if (latency > 1000) {
        console.warn(`⚠️ High Redis latency: ${latency}ms`);
      }
      
      // Check memory usage
      const info = await redis.info('memory');
      const memoryUsed = info.match(/used_memory:(\d+)/);
      if (memoryUsed) {
        const usedMB = parseInt(memoryUsed[1]) / (1024 * 1024);
        if (usedMB > 500) { // Alert if over 500MB
          console.warn(`⚠️ High Redis memory usage: ${usedMB.toFixed(2)}MB`);
        }
      }
    } catch (error) {
      console.error('❌ Redis health check failed:', error.message);
    }
  }, 60000); // Check every minute
};

// Start health monitoring in production
if (process.env.NODE_ENV === 'production') {
  startHealthMonitoring();
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🔄 Gracefully closing Redis connection...');
  redis.disconnect();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = redis;
