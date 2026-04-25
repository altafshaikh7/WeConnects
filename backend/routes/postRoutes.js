const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const postController = require("../controllers/postController");

console.log("🔍 postController keys:", Object.keys(postController));

router.post("/", auth, upload.array("images", 5), postController.createPost);
router.get("/", postController.getPosts);
router.get("/me", auth, postController.getMyPosts);
router.post("/:id/like", auth, postController.toggleLike);
router.post("/:id/comment", auth, postController.addComment);
router.post("/:id/impression", auth, postController.incrementImpression);
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
