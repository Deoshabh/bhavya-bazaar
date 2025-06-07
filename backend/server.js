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
const redisClient = require("./utils/redisClient");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

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

// Initialize Redis connection
redisClient.initialize().then(() => {
  console.log("✅ Redis connection initialized");
}).catch((error) => {
  console.warn("⚠️ Redis initialization failed, falling back to memory storage:", error.message);
});

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
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// —————————— Rate Limiting ——————————
// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

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
app.use("/api/v2/cart", require("./controller/cart"));

// —————————— WebSocketServer on /ws ——————————
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({
  server,
  path: "/ws",
  verifyClient: (info) => {
    // Allow connections from allowed origins
    const origin = info.origin;
    if (!origin) return true; // Allow connections without origin (mobile apps, etc.)
    
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : 
      ['https://bhavyabazaar.com', 'https://www.bhavyabazaar.com'];
    
    return allowedOrigins.includes(origin);
  }
});

wss.on("connection", (ws, req) => {
  console.log("🟢 WebSocket client connected:", req.socket.remoteAddress);
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: "welcome", 
    message: "Connected to Bhavya Bazaar WebSocket",
    timestamp: new Date().toISOString()
  }));

  ws.on("message", (message) => {
    try {
      console.log("📨 Received WebSocket message:", message.toString());
      const data = JSON.parse(message.toString());
      
      // Echo back with type and timestamp
      ws.send(JSON.stringify({ 
        type: "echo",
        originalMessage: data,
        reply: "Message received successfully",
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: "error",
        message: "Invalid JSON format",
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
  });
  
  ws.on("error", (error) => {
    console.error("🚨 WebSocket error:", error);
  });
});

// —————————— Socket.IO (if you still need it) ——————————
const { io, getSocketStatus } = initializeSocket(server);
app.get("/socket/status", (req, res) => {
  res.json(getSocketStatus());
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
const PORT = process.env.PORT || 8000; // Changed default from 443 to 8000
server.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌐 API base: https://api.bhavyabazaar.com`);
  
  // Log environment details for debugging
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`DB URI: ${process.env.DB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`Redis Host: ${process.env.REDIS_HOST || 'Not configured'}`);
  
  // Initialize cache warming on server startup
  console.log("🔥 Cache functionality has been removed");
});
