const User = require("../models/User");
const Post = require("../models/Post");
const notificationController = require("./notificationController");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    })
      .select("name profileImage headline _id")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("SEARCH USERS ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
      replies: [],
    });

    await post.save();
    await post.populate("comments.user", "name profileImage");
    const newComment = post.comments[post.comments.length - 1];

    const emitToManyUsers = req.app.get("emitToManyUsers");
    emitToManyUsers?.([post.user, req.user._id], "comment_update", {
      postId,
      comment: newComment,
      comments: post.comments,
      action: "created",
    });

    if (String(post.user) !== String(req.user._id)) {
      const notification = await notificationController.createNotification(
        post.user,
        req.user._id,
        "comment_added",
        "commented on your post",
        null,
        post._id
      );

      if (notification) {
        notificationController.emitNotification(req, post.user, notification);
      }
    }

    res.json({ msg: "Comment added", comment: newComment });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ error: "Could not add comment" });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Reply cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = post.comments.find((item) => String(item._id) === String(commentId));
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    const reply = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await post.save();
    await post.populate("comments.replies.user", "name profileImage");

    const savedComment = post.comments.find((item) => String(item._id) === String(commentId));
    const savedReply = savedComment.replies[savedComment.replies.length - 1];

    const emitToManyUsers = req.app.get("emitToManyUsers");
    emitToManyUsers?.([post.user, req.user._id], "reply_update", {
      postId,
      commentId,
      reply: savedReply,
      action: "created",
    });

    res.json({ msg: "Reply added", reply: savedReply });
  } catch (err) {
    console.error("ADD REPLY ERROR:", err);
    res.status(500).json({ error: "Could not add reply" });
  }
};

exports.trackProfileView = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    if (String(userId) === String(viewerId)) {
      return res.json({ msg: "Own profile view" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.profileViews = (user.profileViews || 0) + 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyViewed = (user.profileViewers || []).some(
      (view) =>
        String(view.user) === String(viewerId) &&
        new Date(view.viewedAt).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (!alreadyViewed) {
      user.profileViewers.push({ user: viewerId, viewedAt: new Date() });
    }

    await user.save();

    res.json({
      msg: "Profile view tracked",
      profileViews: user.profileViews,
    });
  } catch (err) {
    console.error("TRACK PROFILE VIEW ERROR:", err);
    res.status(500).json({ error: "Could not track view" });
  }
};

exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "comments.user",
      "name profileImage headline"
    );

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post.comments || []);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ error: "Could not fetch comments" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = post.comments.find((item) => String(item._id) === String(commentId));
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (
      String(comment.user) !== String(req.user._id) &&
      String(post.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    post.comments = post.comments.filter((item) => String(item._id) !== String(commentId));
    await post.save();

    const emitToManyUsers = req.app.get("emitToManyUsers");
    emitToManyUsers?.([post.user, req.user._id], "comment_update", {
      postId,
      commentId,
      action: "deleted",
    });

    res.json({ msg: "Comment deleted" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: "Could not delete comment" });
  }
};
