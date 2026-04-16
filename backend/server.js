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
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

// Store active users
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins their own room
  socket.on("user_online", (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`👤 User ${userId} is online`);
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

  // New notification event
  socket.on("send_notification", (data) => {
    const { recipientId, notification } = data;
    io.to(recipientId).emit("receive_notification", notification);
  });

  // 🔹 NEW: Profile view event
  socket.on("profile_viewed", (data) => {
    const { userId, viewerName, viewerImage } = data;
    io.to(userId).emit("profile_view_update", {
      viewerName,
      viewerImage,
      timestamp: new Date(),
    });
  });

  // 🔹 NEW: New comment on post
  socket.on("new_comment", (data) => {
    const { postId, comment, authorId } = data;
    io.emit("receive_comment", {
      postId,
      comment,
      authorId,
      timestamp: new Date(),
    });
  });

  // 🔹 NEW: New reply to comment
  socket.on("new_reply", (data) => {
    const { postId, commentId, reply } = data;
    io.emit("receive_reply", {
      postId,
      commentId,
      reply,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    // Find and remove user from active users
    for (const [userId, socketId] of activeUsers) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`❌ User ${userId} is offline`);
        break;
      }
    }
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