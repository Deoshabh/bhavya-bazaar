require("dotenv").config();
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const { initializeSocket } = require("./socket/socketHandler");
const { ensureDirectoryExists } = require("./utils/fileSystem");

const app = express();

// Load .env again with custom path (if needed)
require("dotenv").config({
  path: path.join(__dirname, "config", ".env"),
});

// Check critical environment variables
if (!process.env.JWT_SECRET_KEY || !process.env.ACTIVATION_SECRET) {
  console.error("Required environment variables are missing!");
  process.exit(1);
}

// Connect to MongoDB and ensure uploads folder exists
connectDatabase();
const uploadsPath = path.join(__dirname, "uploads");
ensureDirectoryExists(uploadsPath);
console.log("Uploads directory ready:", uploadsPath);

const isProduction = process.env.NODE_ENV === "production";
console.log(`Environment mode: ${isProduction ? "production" : "development"}`);

// HTTPS / HTTP server setup
let server;
try {
  if (
    isProduction &&
    process.env.SSL_KEY_PATH &&
    process.env.SSL_CERT_PATH &&
    fs.existsSync(process.env.SSL_KEY_PATH) &&
    fs.existsSync(process.env.SSL_CERT_PATH)
  ) {
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };
    server = https.createServer(sslOptions, app);
    console.log("Using HTTPS with SSL certs.");
  } else {
    server = http.createServer(app);
    console.log("SSL not found or not in production. Using HTTP.");
  }
} catch (err) {
  console.error("Error during HTTPS setup:", err.message);
  server = http.createServer(app);
}

// Allowed frontend origins
const allowedOrigins = [
  "https://bhavyabazaar.com",
  "https://www.bhavyabazaar.com",
  "https://api.bhavyabazaar.com",
  "http://localhost:3000",
  "http://localhost:3005",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server, Postman, curl

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("bhavyabazaar.com")
      ) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("CORS policy: Origin not allowed"));
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

// Global request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable JSON and cookie parsing
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Health Check
app.get("/api/v2/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "backend",
    timestamp: new Date().toISOString(),
  });
});

// Root route
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

// Pre-flight OPTIONS handling
app.options("*", cors());

// Routes
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

// Socket.IO integration
const { io, getSocketStatus } = initializeSocket(server);
app.get("/socket/status", (req, res) => {
  res.json(getSocketStatus());
});

// Error handler middleware
app.use(ErrorHandler);

// Uncaught Exception Handling
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION:", err.message);
  process.exit(1);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED PROMISE REJECTION:", err.message);
  server.close(() => process.exit(1));
});

// Start Server
const PORT = process.env.PORT || 8005;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API base: https://api.bhavyabazaar.com`);
});
