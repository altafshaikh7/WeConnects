const Post = require("../models/Post");

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user); // 🔥 DEBUG

    if ((!text || !text.trim()) && !req.file) {
      return res.status(400).json({ msg: "Post must contain text or image" });
    }

    const image = req.file ? req.file.path : "";

    const post = await Post.create({
      text: text?.trim() || "",
      image,
      user: req.user._id, // ✅ FIXED
    });

    res.status(201).json(post);

  } catch (err) {
    console.error("🔥 ERROR:", err);

    res.status(500).json({
      error: err.message || "Post create failed ❌",
    });
  }
};

// ================= GET POSTS =================
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("🔥 GET ERROR:", err);

    res.status(500).json({
      error: err.message || "Fetch failed ❌",
    });
  }
};