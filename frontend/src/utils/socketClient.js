import io from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      // Emit user online event
      socket.emit("user_online", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners for real-time updates
export const onReceiveNotification = (callback) => {
  if (socket) {
    socket.on("receive_notification", callback);
  }
};

export const onReceiveConnectionRequest = (callback) => {
  if (socket) {
    socket.on("receive_connection_request", callback);
  }
};

export const onConnectionRequestAccepted = (callback) => {
  if (socket) {
    socket.on("connection_request_accepted", callback);
  }
};

export const onConnectionRequestRejected = (callback) => {
  if (socket) {
    socket.on("connection_request_rejected", callback);
  }
};

// Emit functions for actions
export const sendConnectionRequest = (from, to, requestId) => {
  if (socket) {
    socket.emit("send_connection_request", { from, to, requestId });
  }
};

export const acceptConnectionRequest = (from, to) => {
  if (socket) {
    socket.emit("accept_connection_request", { from, to });
  }
};

export const rejectConnectionRequest = (from, to) => {
  if (socket) {
    socket.emit("reject_connection_request", { from, to });
  }
};

export const sendNotification = (recipientId, notification) => {
  if (socket) {
    socket.emit("send_notification", { recipientId, notification });
  }
};
