const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ================= LOAD ENV =================
dotenv.config();

// ================= IMPORTS =================
const connectDB = require("./config/db");
const morgan = require("morgan");
const helmet = require("helmet");
const passport = require("./config/passport");

// ================= INIT APP =================
const app = express();

// ================= DATABASE =================
connectDB();

// ================= MIDDLEWARE =================

// 🔐 Security headers
app.use(helmet());

// 📊 Logger
app.use(morgan("dev"));

// 🌐 CORS (frontend allow)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 📦 Body parser
app.use(express.json());

// 🔑 Passport init
app.use(passport.initialize());

// ================= STATIC FILES =================

// 🔥 Serve uploaded images
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});