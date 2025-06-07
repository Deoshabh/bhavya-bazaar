const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  connectTimeout: 10000,
  commandTimeout: 5000,
};

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
