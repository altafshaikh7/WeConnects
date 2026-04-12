const User = require("../models/User");

// GET PROFILE
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    let updateData = {
      name,
      bio,
    };

    // 🔥 CLOUDINARY IMAGE
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};