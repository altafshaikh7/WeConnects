const express = require("express");
const auth = require("../middleware/auth");
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount,
} = require("../controllers/messageController");

const router = express.Router();

// All routes require authentication
router.use(auth);

// 🔹 GET CONVERSATIONS (all users with messages)
router.get("/conversations", getConversations);

// 🔹 GET UNREAD MESSAGE COUNT
router.get("/unread-count", getUnreadCount);

// 🔹 GET ALL MESSAGES WITH A SPECIFIC USER
router.get("/:userId", getMessages);

// 🔹 SEND MESSAGE
router.post("/send", sendMessage);

// 🔹 MARK MESSAGE AS READ
router.put("/read/:messageId", markAsRead);

// 🔹 MARK ALL MESSAGES FROM A USER AS READ
router.put("/read-all/:userId", markAllAsRead);

// 🔹 DELETE MESSAGE
router.delete("/delete/:messageId", deleteMessage);

module.exports = router;
