const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const passport = require("./config/passport");
const http = require("http");
const { Server } = require("socket.io");

// ================= LOAD ENV =================
dotenv.config();

// ================= INIT APP =================
const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO SETUP =================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", process.env.VITE_FRONTEND_URL],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Ensure websocket is used
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Store active users (userId -> socketId mapping)
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // User joins their own room (CRITICAL FOR NOTIFICATIONS)
  socket.on("user_online", (userId) => {
    if (!userId) {
      console.error("❌ user_online called without userId");
      return;
    }

    // Store user-socket mapping
    activeUsers.set(userId, socket.id);
    // Join room with userId so we can emit to this user later
    socket.join(userId);
    
    console.log(`👤 User ${userId} is online (socket: ${socket.id})`);
    console.log(`📊 Active users: ${activeUsers.size}`);
  });

  // Handle disconnection properly
  socket.on("disconnect", () => {
    // Find and remove user from active users
    for (const [userId, socketId] of activeUsers) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`❌ User ${userId} is offline`);
        console.log(`📊 Active users: ${activeUsers.size}`);
        break;
      }
    }
  });

  // Connection error handling
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  // Listen for connection requests
  socket.on("send_connection_request", (data) => {
    const { from, to, requestId } = data;
    io.to(to).emit("receive_connection_request", {
      from,
      requestId,
      timestamp: new Date(),
    });
  });

  // Listen for request acceptance
  socket.on("accept_connection_request", (data) => {
    const { from, to } = data;
    io.to(from).emit("connection_request_accepted", {
      acceptedBy: to,
      timestamp: new Date(),
    });
  });

  // Listen for request rejection
  socket.on("reject_connection_request", (data) => {
    const { from, to } = data;
    io.to(from).emit("connection_request_rejected", {
      rejectedBy: to,
      timestamp: new Date(),
    });
  });

  // New notification event (backup - API endpoints already emit notifications)
  socket.on("send_notification", (data) => {
    const { recipientId, notification } = data;
    io.to(recipientId).emit("receive_notification", notification);
  });

  // Profile view event
  socket.on("profile_viewed", (data) => {
    const { userId, viewerName, viewerImage } = data;
    io.to(userId).emit("profile_view_update", {
      viewerName,
      viewerImage,
      timestamp: new Date(),
    });
  });

  // New comment on post
  socket.on("new_comment", (data) => {
    const { postId, comment, authorId } = data;
    io.emit("receive_comment", {
      postId,
      comment,
      authorId,
      timestamp: new Date(),
    });
  });

  // New reply to comment
  socket.on("new_reply", (data) => {
    const { postId, commentId, reply } = data;
    io.emit("receive_reply", {
      postId,
      commentId,
      reply,
      timestamp: new Date(),
    });
  });

  // 💬 MESSAGING EVENTS
  // Send message (real-time)
  socket.on("send_message", (data) => {
    const { to, message } = data;
    io.to(to).emit("receive_message", {
      from: socket.id,
      message,
      timestamp: new Date(),
    });
  });

  // User typing indicator
  socket.on("typing", (data) => {
    const { to, isTyping } = data;
    io.to(to).emit("user_typing", {
      isTyping,
      timestamp: new Date(),
    });
  });

  // Mark message as read
  socket.on("message_read", (data) => {
    const { to, messageId } = data;
    io.to(to).emit("message_read_receipt", {
      messageId,
      timestamp: new Date(),
    });
  });
});

// Make io accessible to routes
app.set("io", io);

// ================= DATABASE =================
const connectDB = require("./config/db");
connectDB();

// ================= MIDDLEWARE =================

// 🔐 Security headers
app.use(helmet());

// 📊 Logger
app.use(morgan("dev"));

// 🌐 CORS (IMPORTANT FIX)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// 📦 Body parser
app.use(express.json());

// 🔑 Passport init
app.use(passport.initialize());

// ================= STATIC FILES =================

// (optional - only if using local uploads)
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================

// 🔐 Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// 👤 Profile routes
app.use("/api/profile", require("./routes/profileRoutes"));

// 👥 User routes
app.use("/api/users", require("./routes/userRoutes"));

// 📝 Post routes
app.use("/api/posts", require("./routes/postRoutes"));

// 📰 News routes
app.use("/api/news", require("./routes/newsRoutes"));

// 🔔 Notification routes
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 🔍 Search & Comment routes
app.use("/api/search", require("./routes/searchRoutes"));

// 💬 Message routes
app.use("/api/messages", require("./routes/messageRoutes"));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found ❌" });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({
    error: err.message || "Something went wrong ❌",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});