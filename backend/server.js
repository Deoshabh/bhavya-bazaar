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
const { initializeSocket } = require("./socket/socketHandler");
const { ensureDirectoryExists } = require("./utils/fileSystem");
const redis = require("./config/redis");

const app = express();

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

// Initialize Redis connection with fallback handling
(async () => {
  try {
    await redis.ping();
    console.log("✅ Redis connection is successful!");
    
    // Set global Redis availability flag
    global.redisAvailable = true;
    
    // Register Redis error handlers for graceful degradation
    redis.on('error', (err) => {
      console.warn('⚠️ Redis connection error:', err.message);
      global.redisAvailable = false;
    });
    
    redis.on('connect', () => {
      console.log('🔄 Redis reconnected');
      global.redisAvailable = true;
    });
    
  } catch (error) {
    console.warn("⚠️ Redis connection failed, continuing without cache:", error.message);
    global.redisAvailable = false;
  }
})();

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

app.use(
  cors({
    origin: allowedOrigins,
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
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// —————————— Health & Root Routes ——————————
app.get("/api/v2/health", async (req, res) => {
  try {
    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch (redisError) {
      redisStatus = 'error';
    }

    res.status(200).json({
      status: "healthy",
      service: "backend",
      timestamp: new Date().toISOString(),
      cache: {
        redis: redisStatus
      }
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
    },
    documentation: "https://bhavyabazaar.com/api-docs",
  });
});

// Pre-flight OPTIONS handling (enables CORS pre-flight for all routes)
app.options("*", cors());

// —————————— API Routes ——————————
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

// —————————— WebSocketServer on /ws ——————————
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({
  server,
  path: "/ws",
});

wss.on("connection", (ws, req) => {
  console.log("🟢 WebSocket client connected:", req.socket.remoteAddress);

  ws.on("message", (message) => {
    console.log("📨 Received WebSocket message:", message.toString());
    ws.send(JSON.stringify({ reply: "Echo: " + message.toString() }));
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
  });
});

// —————————— Socket.IO (if you still need it) ——————————
const { io, getSocketStatus } = initializeSocket(server);
app.get("/socket/status", (req, res) => {
  res.json(getSocketStatus());
});

// —————————— Cache Management Routes ——————————
const cacheService = require("./utils/cacheService");
const redisHealth = require("./utils/redisHealth");

// Cache statistics and analytics
app.get("/api/v2/cache/stats", async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get cache stats",
      message: error.message
    });
  }
});

// Performance metrics
app.get("/api/v2/cache/metrics", async (req, res) => {
  try {
    const metrics = await cacheService.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get performance metrics",
      message: error.message
    });
  }
});

// Redis health check
app.get("/api/v2/cache/health", async (req, res) => {
  try {
    const health = await redisHealth.getHealthStatus();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get Redis health status",
      message: error.message,
      healthy: false
    });
  }
});

// Reset analytics
app.post("/api/v2/cache/analytics/reset", async (req, res) => {
  try {
    cacheService.resetAnalytics();
    res.json({ message: "Analytics reset successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to reset analytics",
      message: error.message
    });
  }
});

// Clear cache
app.delete("/api/v2/cache/clear", async (req, res) => {
  try {
    await cacheService.clearAll();
    res.json({ message: "Cache cleared successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to clear cache",
      message: error.message
    });
  }
});

// Cache warming endpoint
app.post("/api/v2/cache/warm", async (req, res) => {
  try {
    const cacheWarmup = require("./utils/cacheWarmup");
    await cacheWarmup.warmAllCaches();
    res.json({ message: "Cache warming initiated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to warm cache",
      message: error.message
    });
  }
});

// Performance benchmark endpoint
app.post("/api/v2/cache/benchmark", async (req, res) => {
  try {
    const performanceBenchmark = require("./utils/performanceBenchmark");
    const results = await performanceBenchmark.runCachePerformanceTests();
    const report = performanceBenchmark.generateReport(results);
    
    res.json({
      message: "Performance benchmark completed",
      report
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to run performance benchmark",
      message: error.message
    });
  }
});

// Redis test suite endpoint
app.post("/api/v2/cache/test", async (req, res) => {
  try {
    const RedisTestSuite = require("./test/redis-test-suite");
    const testSuite = new RedisTestSuite();
    const report = await testSuite.runAllTests();
    
    res.json({
      message: "Redis test suite completed",
      report
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to run Redis test suite",
      message: error.message
    });
  }
});

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
const PORT = process.env.PORT || 443;
server.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌐 API base: https://api.bhavyabazaar.com`);
  
  // Initialize cache warming on server startup
  console.log("🔥 Warming up cache...");
  try {
    const cacheWarmup = require("./utils/cacheWarmup");
    await cacheWarmup.warmAllCaches();
    console.log("✅ Cache warmup completed successfully");
  } catch (error) {
    console.warn("⚠️ Cache warmup failed:", error.message);
  }
});
