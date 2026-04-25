const Message = require("../models/Message");
const User = require("../models/User");
const notificationController = require("./notificationController");

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name profileImage _id")
      .populate("recipient", "name profileImage _id");

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        String(msg.sender._id) === String(userId) ? msg.recipient : msg.sender;
      const conversationId = String(otherUser._id);

      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          user: otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
    });

    const conversationIds = Array.from(conversationsMap.keys());

    await Promise.all(
      conversationIds.map(async (conversationId) => {
        const unreadCount = await Message.countDocuments({
          sender: conversationId,
          recipient: userId,
          read: false,
        });

        const conversation = conversationsMap.get(conversationId);
        if (conversation) {
          conversation.unreadCount = unreadCount;
        }
      })
    );

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversations);
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);
    res.status(500).json({ error: "Could not fetch conversations" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ msg: "User ID required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profileImage _id")
      .populate("recipient", "name profileImage _id");

    res.json(messages);
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    res.status(500).json({ error: "Could not fetch messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ msg: "Recipient and message text required" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient not found" });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
    });

    await message.populate("sender", "name profileImage _id");
    await message.populate("recipient", "name profileImage _id");

    const emitToUserRoom = req.app.get("emitToUserRoom");
    emitToUserRoom?.(recipientId, "receive_message", message);

    let notification = null;
    if (String(recipientId) !== String(senderId)) {
      notification = await notificationController.createNotification(
        recipientId,
        senderId,
        "message_received",
        `${message.sender.name} sent you a message`
      );

      if (notification) {
        notificationController.emitNotification(req, recipientId, notification);
      }
    }

    res.json({ success: true, message, notification });
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Could not send message" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (String(message.recipient) !== String(req.user._id)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (!message.read) {
      message.read = true;
      await message.save();
    }

    const emitToUserRoom = req.app.get("emitToUserRoom");
    emitToUserRoom?.(message.sender, "message_read_receipt", {
      messageId: message._id,
      readAt: new Date(),
    });

    res.json(message);
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark message as read" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const result = await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        read: false,
      },
      { read: true }
    );

    const emitToUserRoom = req.app.get("emitToUserRoom");
    emitToUserRoom?.(userId, "conversation_read", {
      by: currentUserId,
      readAt: new Date(),
    });

    res.json({
      msg: "All messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("MARK ALL AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark messages as read" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (String(message.sender) !== String(currentUserId)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ msg: "Message deleted" });
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res.status(500).json({ error: "Could not delete message" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({ error: "Could not fetch unread count" });
  }
};
