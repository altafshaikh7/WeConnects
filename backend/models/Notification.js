const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For faster queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "connection_request",
        "request_accepted",
        "request_rejected",
        "skill_added",
        "post_liked",
        "comment_added",
        "message_received",
      ],
      required: true,
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowRequest",
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // For faster unread queries
    },
  },
  { timestamps: true }
);

// Compound index for efficient unread count queries
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
