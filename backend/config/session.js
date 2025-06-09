// Session configuration for express-session + connect-redis
// Used for all authentication and session management in Bhavya Bazaar
// Supports user, shop, and admin roles in a single session

const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  legacyMode: true
});
redisClient.connect().catch(console.error);

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
