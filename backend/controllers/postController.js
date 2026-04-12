const Post = require("../models/Post");

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("USER:", req.user);

    // ✅ validation
    if ((!text || !text.trim()) && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        msg: "Post must contain text or image",
      });
    }

    let imageUrls = [];

    // ✅ Cloudinary safe URL extraction
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        // safest option
        return file.path || file.secure_url || "";
      }).filter(Boolean);
    }

    const post = await Post.create({
      text: text?.trim() || "",
      images: imageUrls,
      user: req.user._id,
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
      .populate("user", "name profileImage") // ✅ correct field
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("🔥 GET ERROR:", err);

    res.status(500).json({
      error: err.message || "Fetch failed ❌",
    });
  }
};