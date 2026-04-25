const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const notificationController = require("./notificationController");

const getPublicIdFromUrl = (url = "") => {
  if (!url.includes("/upload/")) return null;

  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const normalizedPath = afterUpload.replace(/^v\d+\//, "");
  const segments = normalizedPath.split("/");
  const lastSegment = segments.pop();
  if (!lastSegment) return null;

  const fileName = lastSegment.replace(/\.[^/.]+$/, "");
  return [...segments, fileName].join("/");
};

const removeStoredImage = async (imageUrl) => {
  if (!imageUrl) return;

  if (imageUrl.includes("res.cloudinary.com")) {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    return;
  }

  if (imageUrl.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ""));
    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
    }
  }
};

const populatePost = (postId) =>
  Post.findById(postId)
    .populate("user", "name profileImage")
    .populate("comments.user", "name profileImage");

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if ((!text || !text.trim()) && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ msg: "Post must contain text or image" });
    }

    const imageUrls = (req.files || [])
      .map((file) => file.path || file.secure_url || "")
      .filter(Boolean);

    const post = await Post.create({
      text: text?.trim() || "",
      images: imageUrls,
      user: req.user._id,
    });

    const populatedPost = await populatePost(post._id);
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Post create failed" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profileImage")
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "name profileImage")
      .populate("comments.user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("MY POSTS ERROR:", err);
    res.status(500).json({ error: "Unable to fetch user posts" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => String(id) === String(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await populatePost(post._id);
    const emitToManyUsers = req.app.get("emitToManyUsers");
    emitToManyUsers?.([updatedPost.user?._id, userId], "like_update", {
      postId: updatedPost._id,
      likes: updatedPost.likes,
      likeCount: updatedPost.likes.length,
      userId,
      action: alreadyLiked ? "unliked" : "liked",
      post: updatedPost,
    });

    if (!alreadyLiked && String(updatedPost.user?._id) !== String(userId)) {
      const notification = await notificationController.createNotification(
        updatedPost.user._id,
        userId,
        "post_liked",
        "liked your post",
        null,
        updatedPost._id
      );

      if (notification) {
        notificationController.emitNotification(req, updatedPost.user._id, notification);
      }
    }

    res.json({ success: true, post: updatedPost });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ success: false, error: err.message || "Like failed" });
  }
};

exports.incrementImpression = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.impressions = (post.impressions || 0) + 1;
    await post.save();

    const updatedPost = await populatePost(post._id);
    res.json(updatedPost);
  } catch (err) {
    console.error("IMPRESSION ERROR:", err);
    res.status(500).json({ msg: "Could not update impressions" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Empty comment" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await populatePost(post._id);
    const comment = updatedPost.comments[updatedPost.comments.length - 1];

    const emitToManyUsers = req.app.get("emitToManyUsers");
    emitToManyUsers?.([updatedPost.user?._id, req.user._id], "comment_update", {
      postId: updatedPost._id,
      comment,
      comments: updatedPost.comments,
      action: "created",
      post: updatedPost,
    });

    if (String(updatedPost.user?._id) !== String(req.user._id)) {
      const notification = await notificationController.createNotification(
        updatedPost.user._id,
        req.user._id,
        "comment_added",
        "commented on your post",
        null,
        updatedPost._id
      );

      if (notification) {
        notificationController.emitNotification(req, updatedPost.user._id, notification);
      }
    }

    res.json({ success: true, post: updatedPost, comment });
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ msg: "Comment failed" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    await Promise.all(
      (post.images || []).map((imageUrl) =>
        removeStoredImage(imageUrl).catch((err) => {
          console.error("IMAGE DELETE ERROR:", err);
        })
      )
    );

    await post.deleteOne();

    const emitToUserRoom = req.app.get("emitToUserRoom");
    emitToUserRoom?.(req.user._id, "post_deleted", { postId: req.params.id });

    res.json({ success: true, msg: "Post deleted", postId: req.params.id });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ success: false, error: "Could not delete post" });
  }
};
