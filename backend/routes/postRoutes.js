const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  createPost,
  getPosts,
} = require("../controllers/postController");

// ✅ FIXED ORDER (multer पहले, auth बाद में)
router.post("/", upload.array("images", 5), auth, createPost);

// GET POSTS
router.get("/", getPosts);

module.exports = router;