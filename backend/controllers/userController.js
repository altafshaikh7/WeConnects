const User = require("../models/User");
const Post = require("../models/Post");
const FollowRequest = require("../models/FollowRequest");
const Notification = require("../models/Notification");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "name headline profileImage bannerImage followers following profileViews"
    );
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ error: "Could not fetch users ❌" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select("-password");
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (String(req.user._id) !== String(targetUser._id)) {
      targetUser.profileViews = (targetUser.profileViews || 0) + 1;
      await targetUser.save();
    }

    res.json(targetUser);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: "Could not fetch user ❌" });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "name profileImage")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("GET USER POSTS ERROR:", err);
    res.status(500).json({ error: "Could not fetch user posts ❌" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (String(targetUser._id) === String(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot follow yourself ❌" });
    }

    const alreadyFollowing = targetUser.followers.some(
      (id) => String(id) === String(currentUser._id)
    );

    if (alreadyFollowing) {
      return res.status(400).json({ msg: "Already following ❌" });
    }

    const existingRequest = await FollowRequest.findOne({
      from: currentUser._id,
      to: targetUser._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ msg: "Request already sent ❌" });
    }

    const followRequest = await FollowRequest.create({
      from: currentUser._id,
      to: targetUser._id,
    });

    // Create notification for receiver
    const notificationController = require("./notificationController");
    const notification = await notificationController.createNotification(
      targetUser._id,
      currentUser._id,
      "connection_request",
      `${currentUser.name} sent you a connection request`,
      followRequest._id
    );

    // Emit notification through Socket.io (ONLY if notification was created successfully)
    if (notification) {
      const io = req.app.get("io");
      io.to(String(targetUser._id)).emit("receive_notification", {
        _id: notification._id,
        sender: notification.sender,
        type: notification.type,
        message: notification.message,
        relatedRequest: notification.relatedRequest,
        createdAt: notification.createdAt,
        read: notification.read,
      });
      console.log(`📬 Notification sent to ${targetUser._id}`);
    }

    // 🔹 EMIT NEW FOLLOW EVENT
    const io = req.app.get("io");
    io.emit("receive_follow_request", {
      from: currentUser._id,
      to: targetUser._id,
      fromName: currentUser.name,
      fromProfileImage: currentUser.profileImage,
      timestamp: new Date(),
    });

    res.json({ msg: "Follow request sent ✅", followRequest });
  } catch (err) {
    console.error("FOLLOW ERROR:", err);
    res.status(500).json({ error: "Follow failed ❌" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (String(targetUser._id) === String(currentUser._id)) {
      return res.status(400).json({ msg: "You cannot unfollow yourself ❌" });
    }

    targetUser.followers = targetUser.followers.filter(
      (id) => String(id) !== String(currentUser._id)
    );
    currentUser.following = currentUser.following.filter(
      (id) => String(id) !== String(targetUser._id)
    );

    await targetUser.save();
    await currentUser.save();

    // 🔹 EMIT UNFOLLOW EVENT
    const io = req.app.get("io");
    io.emit("receive_unfollow", {
      from: currentUser._id,
      to: targetUser._id,
      fromName: currentUser.name,
      timestamp: new Date(),
    });

    res.json({
      targetUser,
      currentUser,
    });
  } catch (err) {
    console.error("UNFOLLOW ERROR:", err);
    res.status(500).json({ error: "Unfollow failed ❌" });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      to: req.user._id,
      status: "pending",
    }).populate("from", "name profileImage headline");

    res.json(requests);
  } catch (err) {
    console.error("GET PENDING REQUESTS ERROR:", err);
    res.status(500).json({ error: "Could not fetch requests ❌" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.id);

    if (!request || String(request.to) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Request not found ❌" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Request already processed ❌" });
    }

    const fromUser = await User.findById(request.from);
    const toUser = await User.findById(request.to);

    // Prevent duplicate entries
    if (!toUser.followers.includes(request.from)) {
      toUser.followers.push(request.from);
    }
    if (!fromUser.following.includes(request.to)) {
      fromUser.following.push(request.to);
    }

    request.status = "accepted";

    await toUser.save();
    await fromUser.save();
    await request.save();

    // Create notification for sender
    const notificationController = require("./notificationController");
    const notification = await notificationController.createNotification(
      request.from,
      request.to,
      "request_accepted",
      `${toUser.name} accepted your connection request`,
      request._id
    );

    // Emit notification through Socket.io (ONLY if notification was created successfully)
    if (notification) {
      const io = req.app.get("io");
      io.to(String(request.from)).emit("receive_notification", {
        _id: notification._id,
        sender: notification.sender,
        type: notification.type,
        message: notification.message,
        relatedRequest: notification.relatedRequest,
        createdAt: notification.createdAt,
        read: notification.read,
      });
      console.log(`📬 Acceptance notification sent to ${request.from}`);
    }

    res.json({
      msg: "Request accepted ✅",
      notification: notification || null,
    });
  } catch (err) {
    console.error("ACCEPT REQUEST ERROR:", err);
    res.status(500).json({ error: "Accept failed ❌" });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.id);

    if (!request || String(request.to) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Request not found ❌" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Request already processed ❌" });
    }

    const toUser = await User.findById(request.to);
    request.status = "rejected";
    await request.save();

    // Create notification for sender
    const notificationController = require("./notificationController");
    const notification = await notificationController.createNotification(
      request.from,
      request.to,
      "request_rejected",
      `${toUser.name} rejected your connection request`,
      request._id
    );

    // Emit notification through Socket.io (ONLY if notification was created successfully)
    if (notification) {
      const io = req.app.get("io");
      io.to(String(request.from)).emit("receive_notification", {
        _id: notification._id,
        sender: notification.sender,
        type: notification.type,
        message: notification.message,
        relatedRequest: notification.relatedRequest,
        createdAt: notification.createdAt,
        read: notification.read,
      });
      console.log(`📬 Rejection notification sent to ${request.from}`);
    }

    res.json({
      msg: "Request rejected ✅",
      notification: notification || null,
    });
  } catch (err) {
    console.error("REJECT REQUEST ERROR:", err);
    res.status(500).json({ error: "Reject failed ❌" });
  }
};

// 🔹 GET FOLLOWERS
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name profileImage headline _id"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    res.json(user.followers);
  } catch (err) {
    console.error("GET FOLLOWERS ERROR:", err);
    res.status(500).json({ error: "Could not fetch followers ❌" });
  }
};

// 🔹 GET FOLLOWING
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name profileImage headline _id"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    res.json(user.following);
  } catch (err) {
    console.error("GET FOLLOWING ERROR:", err);
    res.status(500).json({ error: "Could not fetch following ❌" });
  }
};

// 🔹 ADD SKILL
exports.addSkill = async (req, res) => {
  try {
    const { skill } = req.body;

    if (!skill || skill.trim() === "") {
      return res.status(400).json({ msg: "Skill is required ❌" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (user.skills.includes(skill.trim())) {
      return res.status(400).json({ msg: "Skill already exists ❌" });
    }

    user.skills.push(skill.trim());
    await user.save();

    res.json({ msg: "Skill added successfully ✅", skills: user.skills });
  } catch (err) {
    console.error("ADD SKILL ERROR:", err);
    res.status(500).json({ error: "Could not add skill ❌" });
  }
};

// 🔹 REMOVE SKILL
exports.removeSkill = async (req, res) => {
  try {
    const { skill } = req.body;

    if (!skill) {
      return res.status(400).json({ msg: "Skill is required ❌" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    user.skills = user.skills.filter((s) => s !== skill);
    await user.save();

    res.json({ msg: "Skill removed successfully ✅", skills: user.skills });
  } catch (err) {
    console.error("REMOVE SKILL ERROR:", err);
    res.status(500).json({ error: "Could not remove skill ❌" });
  }
};

// 🔹 GET SUGGESTED USERS (for networking)
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Get users that the current user is not already following
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.following,
      },
    })
      .select("name headline profileImage _id followers")
      .limit(10);

    res.json(suggestedUsers);
  } catch (err) {
    console.error("GET SUGGESTED USERS ERROR:", err);
    res.status(500).json({ error: "Could not fetch suggested users ❌" });
  }
};

// 🔹 GET CONNECTION STATUS (check if already following, pending, etc.)
exports.getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    // Check if already following
    const isFollowing = targetUser.followers.some(
      (id) => String(id) === String(currentUserId)
    );

    // Check for pending request
    const pendingRequest = await FollowRequest.findOne({
      from: currentUserId,
      to: targetUserId,
      status: "pending",
    });

    // Check if target user is following current user
    const isFollowedBy = currentUser.followers.some(
      (id) => String(id) === String(targetUserId)
    );

    res.json({
      isFollowing,
      isPending: !!pendingRequest,
      isFollowedBy,
      requestId: pendingRequest?._id,
    });
  } catch (err) {
    console.error("GET CONNECTION STATUS ERROR:", err);
    res.status(500).json({ error: "Could not fetch connection status ❌" });
  }
};
