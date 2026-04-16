const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    default: "",
  },

  // ✅ MULTIPLE IMAGES
  images: {
    type: [String],
    default: [],
  },

  // ✅ USER
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ✅ LIKES
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // ✅ COMMENTS WITH NESTED REPLIES
  comments: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      // 🔹 NESTED REPLIES
      replies: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          text: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],

  impressions: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);