const Post = require("../models/Post");

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if ((!text || !text.trim()) && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        msg: "Post must contain text or image",
      });
    }

    let imageUrls = [];

    // ✅ CLOUDINARY SAFE
    if (req.files && req.files.length > 0) {
      imageUrls = req.files
        .map((file) => file.path || file.secure_url || "")
        .filter(Boolean);
    }

    const post = await Post.create({
      text: text?.trim() || "",
      images: imageUrls,
      user: req.user._id,
    });

    res.status(201).json(post);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Post create failed ❌" });
  }
};

// ================= GET POSTS =================
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profileImage")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Fetch failed ❌" });
  }
};

// ================= LIKE / UNLIKE =================
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    const userId = req.user._id;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json(post);

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ msg: "Like failed ❌" });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Empty comment ❌" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("user", "name profileImage")
      .populate("comments.user", "name");

    res.json(updatedPost);

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ msg: "Comment failed ❌" });
  }
};