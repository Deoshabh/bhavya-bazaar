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
  path: "config/.env",
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

// create server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 8000}`);
});

// middlewares
app.use(express.json());
app.use(cookieParser());

// Improved CORS setup with explicit allowed headers
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With", 
      "Accept",
      "Origin",
      "Cache-Control"
    ]
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

app.use("/", express.static("uploads"));

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
