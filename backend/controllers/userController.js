const User = require("../models/User");
const Post = require("../models/Post");
const FollowRequest = require("../models/FollowRequest");

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

    res.json({ msg: "Follow request sent", followRequest });
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

    toUser.followers.push(request.from);
    fromUser.following.push(request.to);

    request.status = "accepted";

    await toUser.save();
    await fromUser.save();
    await request.save();

    res.json({ msg: "Request accepted" });
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

    request.status = "rejected";
    await request.save();

    res.json({ msg: "Request rejected" });
  } catch (err) {
    console.error("REJECT REQUEST ERROR:", err);
    res.status(500).json({ error: "Reject failed ❌" });
  }
};
