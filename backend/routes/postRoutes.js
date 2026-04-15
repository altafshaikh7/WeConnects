const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  createPost,
  getPosts,
  getMyPosts,
  toggleLike,
  addComment,
  incrementImpression,
} = require("../controllers/postController");

// ✅ CREATE POST (FIXED ORDER 🔥)
router.post("/", auth, upload.array("images", 5), createPost);

// ✅ GET POSTS
router.get("/", getPosts);

// ✅ GET MY POSTS
router.get("/me", auth, getMyPosts);

// ✅ LIKE
router.post("/:id/like", auth, toggleLike);

// ✅ COMMENT
router.post("/:id/comment", auth, addComment);

// ✅ IMPRESSIONS
router.post("/:id/impression", auth, incrementImpression);

module.exports = router;