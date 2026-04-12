const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const passport = require("./config/passport");

// ================= LOAD ENV =================
dotenv.config();

// ================= INIT APP =================
const app = express();

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

// 📝 Post routes
app.use("/api/posts", require("./routes/postRoutes"));

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});