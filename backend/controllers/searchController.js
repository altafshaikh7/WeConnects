const User = require("../models/User");
const Post = require("../models/Post");

// 🔹 SEARCH USERS BY NAME
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Search by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select("name profileImage headline _id")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("SEARCH USERS ERROR:", err);
    res.status(500).json({ error: "Search failed ❌" });
  }
};

// 🔹 ADD COMMENT TO POST
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Comment cannot be empty ❌" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    // Add comment
    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
      replies: [],
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment
    await post.populate("comments.user", "name profileImage");

    // Get the last comment
    const newComment = post.comments[post.comments.length - 1];

    // 🔹 EMIT SOCKET.IO EVENT
    const io = req.app.get("io");
    if (io) {
      io.emit("receive_comment", {
        postId: postId,
        comment: newComment,
        authorId: req.user._id,
      });
    }

    res.json({
      msg: "Comment added ✅",
      comment: newComment,
    });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ error: "Could not add comment ❌" });
  }
};

// 🔹 ADD REPLY TO COMMENT
exports.addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Reply cannot be empty ❌" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    // Find comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found ❌" });
    }

    // Add reply
    const reply = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await post.save();

    // Populate
    await post.populate("comments.replies.user", "name profileImage");

    // 🔹 EMIT SOCKET.IO EVENT
    const io = req.app.get("io");
    if (io) {
      io.emit("receive_reply", {
        postId: postId,
        commentId: commentId,
        reply: reply,
        authorId: req.user._id,
      });
    }

    res.json({
      msg: "Reply added ✅",
      reply: reply,
    });
  } catch (err) {
    console.error("ADD REPLY ERROR:", err);
    res.status(500).json({ error: "Could not add reply ❌" });
  }
};

// 🔹 TRACK PROFILE VIEW
exports.trackProfileView = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    // Don't count if user is viewing own profile
    if (String(userId) === String(viewerId)) {
      return res.json({ msg: "Own profile view" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    // Increment profile views
    user.profileViews = (user.profileViews || 0) + 1;

    // Track who viewed (add if not already added today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyViewed = user.profileViewers.some(
      (view) =>
        String(view.user) === String(viewerId) &&
        new Date(view.viewedAt).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (!alreadyViewed) {
      user.profileViewers.push({
        user: viewerId,
        viewedAt: new Date(),
      });
    }

    await user.save();

    res.json({
      msg: "Profile view tracked ✅",
      profileViews: user.profileViews,
    });
  } catch (err) {
    console.error("TRACK PROFILE VIEW ERROR:", err);
    res.status(500).json({ error: "Could not track view ❌" });
  }
};

// 🔹 GET POST COMMENTS
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "comments.user",
      "name profileImage headline"
    );

    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    res.json(post.comments || []);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ error: "Could not fetch comments ❌" });
  }
};

// 🔹 DELETE COMMENT
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found ❌" });
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found ❌" });
    }

    // Only allow deletion by comment owner or post owner
    if (
      String(comment.user) !== String(req.user._id) &&
      String(post.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ msg: "Unauthorized ❌" });
    }

    post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
    await post.save();

    res.json({ msg: "Comment deleted ✅" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: "Could not delete comment ❌" });
  }
};
