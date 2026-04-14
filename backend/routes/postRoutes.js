const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/postController");

// ✅ CREATE POST (MULTIPLE IMAGES)
router.post("/", upload.array("images", 5), auth, createPost);

// ✅ GET POSTS
router.get("/", getPosts);

// ✅ LIKE
router.post("/:id/like", auth, toggleLike);

// ✅ COMMENT
router.post("/:id/comment", auth, addComment);

module.exports = router;