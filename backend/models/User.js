const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  // 🔥 PROFILE
  profileImage: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },

  // 🔐 Forgot Password
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = mongoose.model("User", userSchema);