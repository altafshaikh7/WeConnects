const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// 🔥 IMPORTANT: dotenv FIRST load karo
dotenv.config();

const connectDB = require("./config/db");

// 🔥 EXTRA MIDDLEWARE
const morgan = require("morgan");
const helmet = require("helmet");

// 🔥 PASSPORT (dotenv ke baad hi load hoga)
const passport = require("./config/passport");

const app = express();

// ================= DATABASE =================
connectDB();

// ================= MIDDLEWARE =================

// 🔐 Security
app.use(helmet());

// 📊 Logger
app.use(morgan("dev"));

// ✅ CORS (frontend allow)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// 🔥 PASSPORT INIT
app.use(passport.initialize());

// ================= ROUTES =================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({ error: "Something went wrong ❌" });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});