const Redis = require('ioredis');

// Redis configuration with proper authentication handling
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  enableOfflineQueue: true, // Enable offline queue to prevent stream errors
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  connectTimeout: 10000,
  commandTimeout: 5000,
  showFriendlyErrorStack: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Only add password if it's provided and not empty
if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
  redisConfig.password = process.env.REDIS_PASSWORD.trim();
  console.log('🔐 Redis authentication enabled');
} else {
  console.log('🔓 Redis authentication disabled (no password provided)');
}

// Create Redis client
const redis = new Redis(redisConfig);

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis client ready to handle commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis client error:', err.message);
});

redis.on('close', () => {
  console.log('🔴 Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});

module.exports = redis;
