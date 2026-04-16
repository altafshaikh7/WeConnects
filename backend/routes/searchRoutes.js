const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  searchUsers,
  addComment,
  addReply,
  trackProfileView,
  getPostComments,
  deleteComment,
} = require("../controllers/searchController");

// 🔹 Search routes
router.get("/users", auth, searchUsers);

// 🔹 Comment routes
router.post("/posts/:postId/comments", auth, addComment);
router.get("/posts/:postId/comments", auth, getPostComments);
router.delete("/posts/:postId/comments/:commentId", auth, deleteComment);

// 🔹 Reply routes
router.post("/posts/:postId/comments/:commentId/replies", auth, addReply);

// 🔹 Profile view tracking
router.post("/users/:userId/track-view", auth, trackProfileView);

module.exports = router;
