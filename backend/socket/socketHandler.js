// Socket.IO handler for real-time messaging
const socketIO = require("socket.io");
const redisClient = require("../utils/redisClient");

// Initialize Socket.IO
const initializeSocket = (server) => {
  // Define allowed origins from environment variable or use defaults
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv ? 
    allowedOriginsEnv.split(',') : 
    [
      "http://localhost:3000",
      "https://bhavyabazaar.com", 
      "http://bhavyabazaar.com",
      "https://www.bhavyabazaar.com",
      "https://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
      "http://so88s4g4o8cgwscsosk448kw.147.79.66.75.sslip.io",
      "https://api.bhavyabazaar.com",
      "http://api.bhavyabazaar.com"
    ];

  console.log("Allowed origins for socket connections:", allowedOrigins);

  // Initialize Socket.IO with enhanced configuration
  const io = socketIO(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if the origin is allowed
        if (allowedOrigins.indexOf(origin) === -1) {
          console.log(`Socket connection request from unauthorized origin: ${origin}`);
          // For production, be strict about origins
          if (process.env.NODE_ENV === 'production') {
            return callback(new Error('Not allowed by CORS'));
          }
        }
        
        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8, // 100 MB - for file sharing if needed
    allowEIO3: true, // Allow Engine.IO protocol version 3
    serveClient: false // Don't serve client files
  });

  // Set up Redis adapter for Socket.io clustering if Redis is available
  if (redisClient.isRedisConnected()) {
    try {
      const { createAdapter } = require("@socket.io/redis-adapter");
      const { createClient } = require("redis");
      
      // Create Redis clients for Socket.io adapter
      const pubClient = createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
      });
      
      const subClient = pubClient.duplicate();

      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log("✅ Socket.io Redis adapter configured for scaling");
      }).catch((error) => {
        console.warn("⚠️ Failed to set up Socket.io Redis adapter:", error.message);
      });
    } catch (error) {
      console.warn("⚠️ Socket.io Redis adapter not available:", error.message);
    }
  }

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

  // Add socket status endpoint
  const getSocketStatus = () => ({
    status: "online",
    connections: io.engine.clientsCount,
    mode: "integrated with backend",
    serverTime: new Date().toISOString(),
    allowedOrigins,
    activeUsers: users.length
  });

  return { io, getSocketStatus };
};

module.exports = { initializeSocket };
