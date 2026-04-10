const express = require("express");
const router = express.Router();
const passport = require("passport");

// 👇 controllers import
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// ================= AUTH ROUTES =================

// ✅ Register
router.post("/register", register);

// ✅ Login
router.post("/login", login);

// ================= FORGOT PASSWORD =================

// 🔁 Forgot Password
router.post("/forgot-password", forgotPassword);

// 🔐 Reset Password
router.post("/reset-password/:token", resetPassword);

// ================= GOOGLE LOGIN =================

// 🔥 Google Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 🔥 Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token } = req.user;

    // frontend pe bhej rahe
    res.redirect(`http://localhost:5173/google-success?token=${token}`);
  }
);

module.exports = router;