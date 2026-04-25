const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const passport = require("./config/passport");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

const activeUsers = new Map();

const normalizeUserId = (userId) => (userId ? String(userId) : null);

const addSocketForUser = (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;

  const sockets = activeUsers.get(normalizedUserId) || new Set();
  sockets.add(socketId);
  activeUsers.set(normalizedUserId, sockets);
};

const removeSocketForUser = (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;

  const sockets = activeUsers.get(normalizedUserId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    activeUsers.delete(normalizedUserId);
  }
};

const emitToUserRoom = (userId, eventName, payload) => {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;
  io.to(normalizedUserId).emit(eventName, payload);
};

const emitToManyUsers = (userIds = [], eventName, payload) => {
  const seen = new Set();

  userIds.forEach((userId) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId || seen.has(normalizedUserId)) return;
    seen.add(normalizedUserId);
    emitToUserRoom(normalizedUserId, eventName, payload);
  });
};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("user_online", (userId) => {
    const normalizedUserId = normalizeUserId(userId);
    if (!normalizedUserId) return;

    socket.data.userId = normalizedUserId;
    addSocketForUser(normalizedUserId, socket.id);
    socket.join(normalizedUserId);

    socket.emit("socket_ready", {
      socketId: socket.id,
      userId: normalizedUserId,
    });
  });

  socket.on("send_notification", ({ recipientId, notification }) => {
    if (!recipientId || !notification) return;
    emitToUserRoom(recipientId, "new_notification", notification);
  });

  socket.on("send_message", ({ to, message }) => {
    if (!to || !message) return;
    emitToUserRoom(to, "receive_message", message);
  });

  socket.on("typing", ({ to, isTyping }) => {
    if (!to || typeof isTyping !== "boolean") return;
    emitToUserRoom(to, "user_typing", {
      isTyping,
      from: socket.data.userId || null,
      timestamp: new Date(),
    });
  });

  socket.on("message_read", ({ to, messageId }) => {
    if (!to || !messageId) return;
    emitToUserRoom(to, "message_read_receipt", {
      messageId,
      readAt: new Date(),
      by: socket.data.userId || null,
    });
  });

  socket.on("disconnect", () => {
    if (socket.data.userId) {
      removeSocketForUser(socket.data.userId, socket.id);
    }

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);
app.set("emitToUserRoom", emitToUserRoom);
app.set("emitToManyUsers", emitToManyUsers);

const connectDB = require("./config/db");
connectDB();

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
