import io from "socket.io-client";

let socket = null;
let connectionTimeout = null;

/**
 * Initialize Socket.io connection
 * Should be called ONCE on app load with the current user's ID
 */
export const initSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  if (socket && !socket.connected) {
    console.log("🔄 Reconnecting existing socket...");
    socket.connect();
    return socket;
  }

  console.log("🔌 Initializing new Socket.io connection...");

  const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(backendURL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    clearTimeout(connectionTimeout);
    
    // Emit user_online event to join the user's room
    if (userId) {
      socket.emit("user_online", userId);
      console.log(`👤 Emitted user_online for userId: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  // Set connection timeout warning
  connectionTimeout = setTimeout(() => {
    if (!socket.connected) {
      console.warn("⚠️ Socket connection taking longer than expected");
    }
  }, 3000);

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized. Call initSocket() first.");
    return null;
  }
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

/**
 * Disconnect socket (use on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    clearTimeout(connectionTimeout);
    console.log("🔌 Socket disconnected and cleared");
  }
};

/**
 * EVENT LISTENERS - Real-time updates
 */

export const onReceiveNotification = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onReceiveNotification");
    return;
  }

  // Remove existing listener to prevent duplicates
  socket.off("receive_notification");
  
  socket.on("receive_notification", (notification) => {
    console.log("📬 Received notification:", notification);
    callback(notification);
  });
};

export const onReceiveConnectionRequest = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onReceiveConnectionRequest");
    return;
  }

  socket.off("receive_connection_request");
  socket.on("receive_connection_request", callback);
};

export const onConnectionRequestAccepted = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onConnectionRequestAccepted");
    return;
  }

  socket.off("connection_request_accepted");
  socket.on("connection_request_accepted", callback);
};

export const onConnectionRequestRejected = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onConnectionRequestRejected");
    return;
  }

  socket.off("connection_request_rejected");
  socket.on("connection_request_rejected", callback);
};

export const onProfileViewUpdate = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onProfileViewUpdate");
    return;
  }

  socket.off("profile_view_update");
  socket.on("profile_view_update", callback);
};

export const onReceiveComment = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onReceiveComment");
    return;
  }

  socket.off("receive_comment");
  socket.on("receive_comment", callback);
};

export const onReceiveReply = (callback) => {
  if (!socket) {
    console.error("❌ Socket not initialized for onReceiveReply");
    return;
  }

  socket.off("receive_reply");
  socket.on("receive_reply", callback);
};

/**
 * EMIT FUNCTIONS - Send actions to server
 */

export const sendConnectionRequest = (from, to, requestId) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot send connection request");
    return;
  }

  socket.emit("send_connection_request", { from, to, requestId });
  console.log(`📤 Sent connection request from ${from} to ${to}`);
};

export const acceptConnectionRequest = (from, to) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot accept connection request");
    return;
  }

  socket.emit("accept_connection_request", { from, to });
  console.log(`📤 Accepted connection request`);
};

export const rejectConnectionRequest = (from, to) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot reject connection request");
    return;
  }

  socket.emit("reject_connection_request", { from, to });
  console.log(`📤 Rejected connection request`);
};

export const sendNotification = (recipientId, notification) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot send notification");
    return;
  }

  socket.emit("send_notification", { recipientId, notification });
  console.log(`📤 Sent notification to ${recipientId}`);
};

export const emitProfileViewed = (userId, viewerName, viewerImage) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot emit profile view");
    return;
  }

  socket.emit("profile_viewed", { userId, viewerName, viewerImage });
  console.log(`📤 Emitted profile view`);
};

export const emitNewComment = (postId, comment, authorId) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot emit comment");
    return;
  }

  socket.emit("new_comment", { postId, comment, authorId });
  console.log(`📤 Emitted new comment`);
};

export const emitNewReply = (postId, commentId, reply) => {
  if (!isSocketConnected()) {
    console.error("❌ Socket not connected - cannot emit reply");
    return;
  }

  socket.emit("new_reply", { postId, commentId, reply });
  console.log(`📤 Emitted new reply`);
};
