const Notification = require("../models/Notification");
const User = require("../models/User");
const FollowRequest = require("../models/FollowRequest");

// 🔹 GET ALL NOTIFICATIONS FOR CURRENT USER
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name profileImage")
      .populate("relatedRequest")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ error: "Could not fetch notifications ❌" });
  }
};

// 🔹 GET UNREAD NOTIFICATION COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({ error: "Could not fetch unread count ❌" });
  }
};

// 🔹 MARK NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || String(notification.recipient) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Notification not found ❌" });
    }

    notification.read = true;
    await notification.save();

    res.json({ msg: "Marked as read", notification });
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark notification ❌" });
  }
};

// 🔹 MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      { read: true }
    );

    res.json({ msg: "All notifications marked as read ✅" });
  } catch (err) {
    console.error("MARK ALL AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark all notifications ❌" });
  }
};

// 🔹 DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || String(notification.recipient) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Notification not found ❌" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ msg: "Notification deleted ✅" });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ error: "Could not delete notification ❌" });
  }
};

// 🔹 CREATE NOTIFICATION (Internal helper - called by other controllers)
exports.createNotification = async (
  recipientId,
  senderId,
  type,
  message = "",
  relatedRequestId = null
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      relatedRequest: relatedRequestId,
    });

    return notification;
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
  }
};
