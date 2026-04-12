const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/User");

// ================= GET PROFILE =================
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE PROFILE =================
router.put("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, bio } = req.body;

    let updateData = {
      name,
      bio,
    };

    // 🔥 Cloudinary image
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;