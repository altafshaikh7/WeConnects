import { io } from "socket.io-client";

let socket = null;
let currentUserId = null;

const backendOrigin =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://127.0.0.1:5000");

export const initSocket = (userId) => {
  currentUserId = userId || currentUserId;

  if (!socket) {
    socket = io(backendOrigin, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
      }
    });

    socket.on("reconnect", () => {
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });
  }

  if (!socket.connected) {
    socket.connect();
  } else if (currentUserId) {
    socket.emit("user_online", currentUserId);
  }

  return socket;
};

export const getSocket = () => socket;

export const isSocketConnected = () => Boolean(socket?.connected);

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentUserId = null;
};

export const subscribeToSocketEvent = (eventName, callback) => {
  if (!socket) return () => {};

  socket.on(eventName, callback);
  return () => {
    socket?.off(eventName, callback);
  };
};

export const emitSocketEvent = (eventName, payload) => {
  if (!socket?.connected) return false;
  socket.emit(eventName, payload);
  return true;
};

export const onReceiveNotification = (callback) =>
  subscribeToSocketEvent("new_notification", callback);

export const onReceiveMessage = (callback) =>
  subscribeToSocketEvent("receive_message", callback);

export const onTyping = (callback) => subscribeToSocketEvent("user_typing", callback);

export const onLikeUpdate = (callback) =>
  subscribeToSocketEvent("like_update", callback);

export const onCommentUpdate = (callback) =>
  subscribeToSocketEvent("comment_update", callback);

export const onReplyUpdate = (callback) =>
  subscribeToSocketEvent("reply_update", callback);

export const onFollowRequest = (callback) =>
  subscribeToSocketEvent("follow_request", callback);

export const onConnectionUpdate = (callback) =>
  subscribeToSocketEvent("connection_update", callback);

export const onPostDeleted = (callback) =>
  subscribeToSocketEvent("post_deleted", callback);
