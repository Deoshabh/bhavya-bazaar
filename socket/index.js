const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

require("dotenv").config({
  path: "./.env",
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
});

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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});
