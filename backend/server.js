require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const { ensureDirectoryExists } = require("./utils/fileSystem");
const redisClient = require("./utils/redisClient");

// Import performance optimization utilities
const { dbOptimizer, optimizeMongoConnection } = require("./utils/databaseOptimizer");
const { cacheManager } = require("./utils/cacheManager");
const { recommendationEngine } = require("./utils/recommendationEngine");

// Import rate limiters with fallback
let apiLimiter, authLimiter;
try {
  const rateLimiters = require("./middleware/rateLimiter");
  apiLimiter = rateLimiters.apiLimiter;
  authLimiter = rateLimiters.authLimiter;
} catch (error) {
  console.error("Failed to load rate limiters:", error.message);
  console.log("Creating fallback rate limiters...");
  
  // Fallback rate limiters using express-rate-limit directly
  const rateLimit = require('express-rate-limit');
  
  apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
  });
  
  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again later.' }
  });
}

const app = express();

// Trust proxy configuration - secure setup for production
if (process.env.NODE_ENV === 'production') {
  // In production, trust only specific proxy configurations
  // This prevents IP spoofing attacks while allowing legitimate proxy forwarding
  const trustedProxies = process.env.TRUSTED_PROXIES;
  
  if (trustedProxies) {
    // Trust specific IP addresses/subnets
    const proxies = trustedProxies.split(',').map(ip => ip.trim());
    app.set('trust proxy', proxies);
    console.log('✅ Trust proxy configured for specific IPs:', proxies);
  } else {
    // Trust only the first proxy (common for single reverse proxy setups)
    app.set('trust proxy', 1);
    console.log('✅ Trust proxy configured for first proxy only');
  }
} else {
  // In development, we can be more permissive
  app.set('trust proxy', true);
  console.log('⚠️ Trust proxy set to true (development mode)');
}

// Load additional .env if you have a custom file path (optional):
require("dotenv").config({
  path: path.join(__dirname, "config", ".env"),
});

// Verify critical environment vars
if (!process.env.JWT_SECRET_KEY || !process.env.ACTIVATION_SECRET) {
  console.error("❌ Required environment variables are missing!");
  process.exit(1);
}

// Connect to MongoDB and create uploads folder
connectDatabase();

// Initialize Redis connection with error handling
const initializeRedis = async () => {
  try {
    if (redisClient) {
      // Check if redisClient has the initialize method
      if (typeof redisClient.initialize === 'function') {
        await redisClient.initialize();
        console.log("✅ Redis connection initialized via initialize()");
        global.redisAvailable = true;
      } else if (typeof redisClient.connect === 'function') {
        await redisClient.connect();
        console.log("✅ Redis connection initialized via connect()");
        global.redisAvailable = true;
      } else {
        console.warn("⚠️ Redis client doesn't have initialize or connect method, available methods:", Object.getOwnPropertyNames(redisClient));
        global.redisAvailable = false;
      }
    } else {
      console.warn("⚠️ Redis client is not available");
      global.redisAvailable = false;
    }
  } catch (error) {
    console.warn("⚠️ Redis initialization failed, falling back to memory storage:", error.message);
    global.redisAvailable = false;
  }
};

initializeRedis();

const uploadsPath = path.join(__dirname, "uploads");
ensureDirectoryExists(uploadsPath);
console.log("✅ Uploads directory ready:", uploadsPath);

const isProduction = process.env.NODE_ENV === "production";
console.log(`⚙️ Environment mode: ${isProduction ? "production" : "development"}`);

// —————————— Server Setup ——————————
// **Use a plain HTTP server; Coolify’s external proxy will handle TLS/WSS**
const server = http.createServer(app);
console.log("⚙️ Using HTTP server; Coolify will handle TLS/WSS for you.");

// —————————— CORS Setup ——————————
const rawCors = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawCors
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

// Add default origins if none specified
if (allowedOrigins.length === 0) {
  if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push(
      "https://bhavyabazaar.com",
      "https://www.bhavyabazaar.com"
    );
  } else {
    allowedOrigins.push(
      "https://bhavyabazaar.com",
      "https://www.bhavyabazaar.com",
      "http://localhost:3000"
    );
  }
}

console.log("🌐 Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS blocked request from: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
    ],
    exposedHeaders: ["Content-Range", "X-Total-Count"],
  })
);

// —————————— Logging, Parsing, Static ——————————
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(cookieParser());
const sessionMiddleware = require('./config/session');
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// —————————— Rate Limiting ——————————
// Apply general rate limiting to all API routes
if (apiLimiter && typeof apiLimiter === 'function') {
  app.use("/api/", apiLimiter);
  console.log("✅ API rate limiter enabled");
} else {
  console.warn("⚠️ API rate limiter not available, proceeding without rate limiting");
}

// —————————— Debug endpoint for production troubleshooting ——————————
app.get("/api/v2/debug/env", (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(403).json({ error: "Debug endpoint only available in production" });
  }
  
  res.json({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    hasDbUri: !!process.env.DB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET_KEY,
    hasActivationSecret: !!process.env.ACTIVATION_SECRET,
    corsOrigin: process.env.CORS_ORIGIN,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    hasRedisPassword: !!process.env.REDIS_PASSWORD,
    redisAvailable: global.redisAvailable || false,
    timestamp: new Date().toISOString()
  });
});

// —————————— Health & Root Routes ——————————
// Enhanced health check routes
app.use("/api/v2", require("./routes/health"));

// Legacy health endpoint for backward compatibility
app.get("/api/v2/health", async (req, res) => {
  try {
    res.status(200).json({
      status: "healthy",
      service: "backend",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Bhavya Bazaar API Server",
    status: "online",
    version: "2.0",
    endpoints: {
      user: "/api/v2/user",
      shop: "/api/v2/shop",
      product: "/api/v2/product",
      order: "/api/v2/order",
      event: "/api/v2/event",
      conversation: "/api/v2/conversation",
      message: "/api/v2/message",
      health: "/api/v2/health/detailed"
    },
    documentation: "https://bhavyabazaar.com/api-docs",
  });
});

// Pre-flight OPTIONS handling (enables CORS pre-flight for all routes)
app.options("*", cors());

// —————————— API Routes ——————————
app.use("/api/auth", require("./controller/auth")); // New unified auth routes
app.use("/api/v2/user", require("./controller/user"));
app.use("/api/v2/shop", require("./controller/shop"));
app.use("/api/v2/product", require("./controller/product"));
app.use("/api/v2/order", require("./controller/order"));
app.use("/api/v2/event", require("./controller/event"));
app.use("/api/v2/conversation", require("./controller/conversation"));
app.use("/api/v2/message", require("./controller/message"));
app.use("/api/v2/coupon", require("./controller/coupounCode"));
app.use("/api/v2/payment", require("./controller/payment"));
app.use("/api/v2/withdraw", require("./controller/withdraw"));
app.use("/api/v2/cart", require("./controller/cart"));

// Add AI-powered recommendation routes
app.use("/api/v2/recommendations", require("./routes/recommendations"));

// Add optimized product routes (alongside existing product routes)
app.use("/api/v2/products", require("./routes/optimizedProduct"));

// —————————— Error Handling & Unhandled Exceptions ——————————
app.use(ErrorHandler);

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err.message);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED PROMISE REJECTION:", err.message);
  server.close(() => process.exit(1));
});

// —————————— Start Listening on PORT=443 ——————————
const PORT = process.env.PORT || 8000; // Changed default from 443 to 8000
server.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌐 API base: https://api.bhavyabazaar.com`);
  
  // Log environment details for debugging
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`DB URI: ${process.env.DB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`Redis Host: ${process.env.REDIS_HOST || 'Not configured'}`);
  
  // Initialize performance optimizations
  try {
    // Initialize database optimizer
    dbOptimizer.initialize();
    
    // Optimize MongoDB connection settings
    optimizeMongoConnection();
    
    // Initialize cache manager
    if (cacheManager && typeof cacheManager.initialize === 'function') {
      await cacheManager.initialize();
      console.log('✅ Cache manager initialized');
    }
    
    // Warm up critical caches
    if (cacheManager && typeof cacheManager.warmup === 'function') {
      await cacheManager.warmup();
      console.log('🔥 Cache warmup completed');
    }
    
    // Initialize AI recommendation engine
    await recommendationEngine.initialize();
    console.log('🤖 AI Recommendation Engine initialized');
    
    console.log('🚀 Performance optimizations initialized');
  } catch (error) {
    console.error('⚠️ Performance optimization initialization failed:', error);
  }
});
