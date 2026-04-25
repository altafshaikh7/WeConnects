const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name profileImage _id")
      .populate("relatedRequest")
      .populate("relatedPost", "text _id images")
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ error: "Could not fetch notifications" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({ error: "Could not fetch unread count" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || String(notification.recipient) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    res.json({ msg: "Marked as read", notification });
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark notification" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({
      msg: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("MARK ALL AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark all notifications" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || String(notification.recipient) !== String(req.user._id)) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ error: "Could not delete notification" });
  }
};

exports.createNotification = async (
  recipientId,
  senderId,
  type,
  message,
  relatedRequestId = null,
  relatedPostId = null
) => {
  try {
    if (!recipientId || !senderId || !type || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      relatedRequest: relatedRequestId,
      relatedPost: relatedPostId,
    });

    return Notification.findById(notification._id)
      .populate("sender", "name profileImage _id")
      .populate("relatedRequest")
      .populate("relatedPost", "text _id images");
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
    return null;
  }
};

exports.emitNotification = (req, recipientId, notification) => {
  const emitToUserRoom = req?.app?.get("emitToUserRoom");
  if (!emitToUserRoom || !recipientId || !notification) return;
  emitToUserRoom(recipientId, "new_notification", notification);
};
