const Message = require("../models/Message");
const User = require("../models/User");

// 🔹 GET ALL CONVERSATIONS (unique users user has messaged)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name profileImage _id")
      .populate("recipient", "name profileImage _id");

    // Extract unique users from conversations
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        String(msg.sender._id) === String(userId) ? msg.recipient : msg.sender;
      const conversationId = otherUser._id.toString();

      if (!conversationsMap.has(conversationId)) {
        conversationsMap.set(conversationId, {
          user: otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
    });

    // Count unread messages for each conversation
    for (const [userId2, conversation] of conversationsMap) {
      const unreadCount = await Message.countDocuments({
        sender: userId2,
        recipient: userId,
        read: false,
      });
      conversation.unreadCount = unreadCount;
    }

    // Sort by last message time
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversations);
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);
    res.status(500).json({ error: "Could not fetch conversations ❌" });
  }
};

// 🔹 GET MESSAGES WITH A SPECIFIC USER
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ msg: "User ID required ❌" });
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
    res.status(500).json({ error: "Could not fetch messages ❌" });
  }
};

// 🔹 SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ msg: "Recipient and message text required ❌" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: "Recipient not found ❌" });
    }

    // Create and save message
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
    });

    // Populate sender and recipient data
    await message.populate("sender", "name profileImage _id");
    await message.populate("recipient", "name profileImage _id");

    res.json(message);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ error: "Could not send message ❌" });
  }
};

// 🔹 MARK MESSAGE AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ msg: "Message not found ❌" });
    }

    res.json(message);
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark message as read ❌" });
  }
};

// 🔹 MARK ALL MESSAGES AS READ FROM A USER
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

    res.json({
      msg: "All messages marked as read ✅",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("MARK ALL AS READ ERROR:", err);
    res.status(500).json({ error: "Could not mark messages as read ❌" });
  }
};

// 🔹 DELETE MESSAGE
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found ❌" });
    }

    // Only sender can delete their own message
    if (String(message.sender) !== String(currentUserId)) {
      return res.status(403).json({ msg: "Unauthorized ❌" });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ msg: "Message deleted ✅" });
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res.status(500).json({ error: "Could not delete message ❌" });
  }
};

// 🔹 GET UNREAD MESSAGE COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const count = await Message.countDocuments({
      recipient: currentUserId,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({ error: "Could not fetch unread count ❌" });
  }
};
