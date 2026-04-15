const User = require("../models/User");

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("PROFILE FETCH ERROR:", err);
    res.status(500).json({ error: "Could not fetch profile ❌" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, headline, skills } = req.body;

    let updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (headline !== undefined) updateData.headline = headline;

    if (skills !== undefined) {
      updateData.skills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = req.files.profileImage[0].path;
    }

    if (req.files?.bannerImage?.[0]) {
      updateData.bannerImage = req.files.bannerImage[0].path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ error: "Profile update failed ❌" });
  }
};

exports.deleteBannerImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bannerImage: "" },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("DELETE BANNER ERROR:", err);
    res.status(500).json({ error: "Could not delete banner image ❌" });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: "" },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("DELETE PROFILE IMAGE ERROR:", err);
    res.status(500).json({ error: "Could not delete profile image ❌" });
  }
};