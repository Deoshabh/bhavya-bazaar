// Session configuration for express-session + connect-redis
// Used for all authentication and session management in Bhavya Bazaar
// Supports user, shop, and admin roles in a single session

const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Create Redis client with proper configuration for connect-redis v7
const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

// Connect to Redis with error handling
redisClient.connect().catch((err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected for session store');
});

const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: isProduction ? '.bhavyabazaar.com' : undefined
  }
});

module.exports = sessionMiddleware;
