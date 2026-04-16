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
  getFollowers,
  getFollowing,
  addSkill,
  removeSkill,
  getSuggestedUsers,
  getConnectionStatus,
} = require("../controllers/userController");

router.get("/", auth, getAllUsers);
router.get("/suggested", auth, getSuggestedUsers);
router.get("/:id", auth, getUserById);
router.get("/:id/posts", auth, getUserPosts);
router.get("/:id/followers", auth, getFollowers);
router.get("/:id/following", auth, getFollowing);
router.get("/:id/connection-status", auth, getConnectionStatus);

router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);

router.post("/skills/add", auth, addSkill);
router.post("/skills/remove", auth, removeSkill);

router.get("/requests/pending", auth, getPendingRequests);
router.post("/requests/:id/accept", auth, acceptRequest);
router.post("/requests/:id/reject", auth, rejectRequest);

module.exports = router;
