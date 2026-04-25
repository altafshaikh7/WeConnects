const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    const settings = {
      profile: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        headline: user.headline || "",
        bio: user.bio || "",
        company: user.company || "",
        position: user.position || "",
        website: user.website || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || ""
      },
      notifications: user.notifications || { email: true, push: true, sms: false },
      privacy: user.privacy || { profileVisibility: "public", showEmail: false, showPhone: false },
      appearance: user.appearance || { theme: "light", fontSize: "medium" }
    };

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, location, headline, bio, company, position, website, github, linkedin, twitter } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone, location, headline, bio, company, position, website, github, linkedin, twitter } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/notifications", auth, async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "notifications.email": email, "notifications.push": push, "notifications.sms": sms } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Notification settings updated", notifications: user.notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/privacy", auth, async (req, res) => {
  try {
    const { profileVisibility, showEmail, showPhone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "privacy.profileVisibility": profileVisibility, "privacy.showEmail": showEmail, "privacy.showPhone": showPhone } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Privacy settings updated", privacy: user.privacy });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/appearance", auth, async (req, res) => {
  try {
    const { theme, fontSize } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "appearance.theme": theme, "appearance.fontSize": fontSize } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Appearance settings updated", appearance: user.appearance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;