const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 🔥 EMAIL IMPORT (IMPORTANT)
const sendEmail = require("../utils/sendEmail");

// ================== SIGNUP ==================

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: pass, ...userData } = user._doc;

    res.json({ user: userData, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: pass, ...userData } = user._doc;

    res.json({ user: userData, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================== FORGOT PASSWORD ==================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: "User not found" });

    // 🔑 Generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // 🔗 Reset link
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    console.log("Sending email to:", user.email);

    // 📧 SEND EMAIL (MAIN PART 🔥)
    await sendEmail(
      user.email,
      "Password Reset",
      `Click this link to reset your password: ${resetLink}`
    );

    res.json({ msg: "Reset link sent to email 📩" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// ================== RESET PASSWORD ==================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ msg: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};