const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getProfile,
  updateProfile,
  deleteBannerImage,
  deleteProfileImage,
} = require("../controllers/profileController");

// ================= GET MY PROFILE =================
router.get("/", auth, getProfile);

// ================= UPDATE PROFILE =================
router.put(
  "/",
  auth,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  updateProfile
);

// ================= DELETE BANNER IMAGE =================
router.delete("/banner", auth, deleteBannerImage);

// ================= DELETE PROFILE IMAGE =================
router.delete("/avatar", auth, deleteProfileImage);

module.exports = router;