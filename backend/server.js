require('dotenv').config();

const express = require("express");
const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ensureDirectoryExists } = require('./utils/fileSystem');
const path = require('path');

// Load env variables first to ensure they're available everywhere
require("dotenv").config({
  path: path.join(__dirname, "config", ".env"),
});

// Check required environment variables
if (!process.env.JWT_SECRET_KEY) {
  console.error("JWT_SECRET_KEY is not set in environment variables!");
  process.exit(1);
}

if (!process.env.ACTIVATION_SECRET) {
  console.error("ACTIVATION_SECRET is not set in environment variables!");
  process.exit(1);
}

// Connect to database and create uploads directory
connectDatabase();

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
ensureDirectoryExists(uploadsPath);
console.log('Uploads directory checked/created at:', uploadsPath);

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Create server with proper port from env
const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API server URL: ${isProduction ? 'https://api.bhavyabazaar.com' : `http://localhost:${PORT}`}`);
});

// middlewares
app.use(express.json());
app.use(cookieParser());

// Define all allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://bhavyabazaar.com",
  "https://www.bhavyabazaar.com", 
  "http://bhavyabazaar.com",
  "https://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
  "http://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
  "https://api.bhavyabazaar.com",
  "http://api.bhavyabazaar.com"
];

// Improved CORS setup with explicit allowed headers
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log(`Backend request from unauthorized origin: ${origin}`);
        // In production, be more strict about origins
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Not allowed by CORS'));
        }
      }
      
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With", 
      "Accept",
      "Origin",
      "Cache-Control"
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count']
  })
);

// Debug CORS setup
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// OPTIONS pre-flight handling for CORS
app.options('*', cors());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add a proper root route handler
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
      message: "/api/v2/message"
    },
    documentation: "https://bhavyabazaar.com/api-docs"
  });
});

app.get("/test", (req, res) => {
  res.send("Hello World! Environment is properly configured.");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const message = require("./controller/message");
const conversation = require("./controller/conversation");
const withdraw = require("./controller/withdraw");

// end points
app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);

// it's for error handling
app.use(ErrorHandler);

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling UNCAUGHT EXCEPTION! 💥`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
