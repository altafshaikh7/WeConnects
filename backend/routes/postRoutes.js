const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const {
  createPost,
  getPosts,
} = require("../controllers/postController");

// 🔥 PROTECTED CREATE
router.post("/", auth, upload.single("image"), createPost);

// 🔓 PUBLIC GET
router.get("/", getPosts);

module.exports = router;