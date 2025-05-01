const socketIO = require("socket.io");
const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Load env variables first to ensure they're available
require("dotenv").config({
  path: path.join(__dirname, "config", ".env")
});

// Accept connections from all domains where your app might be deployed
const allowedOrigins = [
  "http://localhost:3000",
  "https://bhavyabazaar.com", 
  "http://bhavyabazaar.com",
  "https://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
  "http://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
  "https://api.bhavyabazaar.com",
  "http://api.bhavyabazaar.com"
];

console.log("Allowed origins for socket connections:", allowedOrigins);

// Check if SSL certificates are available
let server;
try {
  // For production with SSL
  if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH && 
      fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH)) {
    
    console.log("Starting secure WebSocket server (WSS)");
    console.log("Using SSL certificates from:", process.env.SSL_KEY_PATH, process.env.SSL_CERT_PATH);
    
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    server = https.createServer(sslOptions, app);
  } else {
    // For development or if no SSL certs available
    console.log("SSL certificates not found. Starting non-secure WebSocket server (WS)");
    server = http.createServer(app);
  }
} catch (error) {
  console.error("Error in server setup:", error.message);
  console.log("Falling back to non-secure WebSocket server");
  server = http.createServer(app);
}

// Initialize Socket.IO with enhanced configuration
const io = socketIO(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log(`Socket connection request from unauthorized origin: ${origin}`);
        return callback(null, true); // Allow all origins for now
      }
      
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  path: "/socket.io", // Explicitly setting the Socket.IO path
  transports: ["websocket", "polling"], // Support both WebSocket and long-polling
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Ping clients more frequently
});

// Express middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`HTTP request from unauthorized origin: ${origin}`);
      return callback(null, true); // Allow all origins for now
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.use(express.json());

// Basic route for health check
app.get("/", (req, res) => {
  res.send("Socket server is running!");
});

// Add status endpoint
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    connections: io.engine.clientsCount,
    mode: server instanceof https.Server ? "secure (WSS)" : "non-secure (WS)",
    serverTime: new Date().toISOString(),
    allowedOrigins
  });
});

// Socket.IO connection handling
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// Define a message object with a seen property
const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
  createdAt: Date.now(),
  id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
});

io.on("connection", (socket) => {
  // when connect
  console.log(`User connected: ${socket.id}`);

  // take userId and socketId from user
  socket.on("addUser", (userId) => {
    if (userId) {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
      console.log(`User ${userId} added with socket ID: ${socket.id}`);
      console.log("Current users:", users);
    }
  });

  // send and get message
  const messages = {}; // Object to track messages sent to each user

  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    try {
      if (!senderId || !receiverId) {
        console.error("Missing senderId or receiverId in sendMessage event");
        return;
      }

      const message = createMessage({ senderId, receiverId, text, images });
      const user = getUser(receiverId);

      // Store the messages in the `messages` object
      if (!messages[receiverId]) {
        messages[receiverId] = [message];
      } else {
        messages[receiverId].push(message);
      }

      // send the message to the receiver
      if (user?.socketId) {
        io.to(user.socketId).emit("getMessage", message);
        console.log(`Message sent to user ${receiverId} with socket ID: ${user.socketId}`);
      } else {
        console.log(`User ${receiverId} is not connected, message stored for later delivery`);
      }
    } catch (error) {
      console.error("Error in sendMessage event:", error);
    }
  });

  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    try {
      const user = getUser(senderId);

      // update the seen flag for the message
      if (messages[senderId]) {
        const message = messages[senderId].find(
          (message) =>
            message.receiverId === receiverId && message.id === messageId
        );
        if (message) {
          message.seen = true;

          // send a message seen event to the sender
          if (user?.socketId) {
            io.to(user.socketId).emit("messageSeen", {
              senderId,
              receiverId,
              messageId,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in messageSeen event:", error);
    }
  });

  // update and get last message
  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
    try {
      io.emit("getLastMessage", {
        lastMessage,
        lastMessagesId,
      });
    } catch (error) {
      console.error("Error in updateLastMessage event:", error);
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// Use the PORT from environment variable or fallback to 3003
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
  console.log(`Mode: ${server instanceof https.Server ? 'Secure (WSS)' : 'Non-secure (WS)'}`);
});
