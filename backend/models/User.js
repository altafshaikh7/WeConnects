const mongoose = require("mongoose");

// 🔹 EXPERIENCE
const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  from: Date,
  to: Date,
  current: Boolean,
  description: String,
});

// 🔹 EDUCATION
const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  from: Date,
  to: Date,
  description: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 🔥 PROFILE IMAGES
    profileImage: {
      type: String,
      default: "https://via.placeholder.com/150",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    headline: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    profileViews: {
      type: Number,
      default: 0,
    },

    // 🔹 TRACK WHO VIEWED PROFILE
    profileViewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🔹 POST IMPRESSIONS
    postImpressions: {
      type: Number,
      default: 0,
    },

    experience: [experienceSchema],
    education: [educationSchema],

    resetToken: String,
    resetTokenExpire: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);