const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getAllUsers,
  getUserById,
  getUserPosts,
  followUser,
  unfollowUser,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/userController");

router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUserById);
router.get("/:id/posts", auth, getUserPosts);
router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);
router.get("/requests/pending", auth, getPendingRequests);
router.post("/requests/:id/accept", auth, acceptRequest);
router.post("/requests/:id/reject", auth, rejectRequest);

module.exports = router;
