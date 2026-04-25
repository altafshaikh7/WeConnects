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
const app = express();  // ✅ IMPORTANT - app defined here
const server = http.createServer(app);

// ================= SOCKET.IO SETUP =================
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

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("user_online", (userId) => {
    if (!userId) return;
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`👤 User ${userId} is online`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

app.set("io", io);

// ================= DATABASE =================
const connectDB = require("./config/db");
connectDB();

// ================= MIDDLEWARE =================
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
console.log("\n🔍 LOADING ROUTES...\n");

app.use("/api/auth", require("./routes/authRoutes"));
console.log("✅ /api/auth loaded");

app.use("/api/profile", require("./routes/profileRoutes"));
console.log("✅ /api/profile loaded");

app.use("/api/users", require("./routes/userRoutes"));
console.log("✅ /api/users loaded");

app.use("/api/posts", require("./routes/postRoutes"));
console.log("✅ /api/posts loaded");

app.use("/api/news", require("./routes/newsRoutes"));
console.log("✅ /api/news loaded");

app.use("/api/notifications", require("./routes/notificationRoutes"));
console.log("✅ /api/notifications loaded");

app.use("/api/search", require("./routes/searchRoutes"));
console.log("✅ /api/search loaded");

app.use("/api/messages", require("./routes/messageRoutes"));
console.log("✅ /api/messages loaded");

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= ERROR HANDLERS =================
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found ❌" });
});

app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({ error: err.message || "Something went wrong ❌" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://127.0.0.1:${PORT}\n`);
});