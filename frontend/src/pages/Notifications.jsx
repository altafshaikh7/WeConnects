import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  initSocket,
  onReceiveNotification,
  getSocket,
  disconnectSocket,
} from "../utils/socketClient";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setError("");
      const res = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
      console.log(`✅ Fetched ${res.data?.length || 0} notifications`);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  // Fetch unread count from API
  const getUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
      console.log(`📊 Unread count: ${res.data.unreadCount || 0}`);
    } catch (err) {
      console.error("❌ Error fetching unread count:", err);
    }
  }, [API, token]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await axios.put(`${API}/notifications/${notificationId}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
        console.log(`✅ Marked notification as read`);
      } catch (err) {
        console.error("❌ Error marking notification as read:", err);
      }
    },
    [API, token]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(`${API}/notifications/read/all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
      console.log(`✅ Marked all notifications as read`);
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
    }
  }, [API, token]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await axios.delete(`${API}/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );

        // Recalculate unread count
        getUnreadCount();
        console.log(`✅ Deleted notification`);
      } catch (err) {
        console.error("❌ Error deleting notification:", err);
      }
    },
    [API, token, getUnreadCount]
  );

  // Initialize socket and fetch data on component mount
  useEffect(() => {
    if (!currentUser._id) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }

    // Initialize Socket.io
    console.log("🔌 Initializing Socket.io...");
    initSocket(currentUser._id);

    // Fetch initial data
    fetchNotifications();
    getUnreadCount();

    // Set up real-time notification listener
    console.log("👂 Setting up notification listener...");
    onReceiveNotification((newNotification) => {
      console.log("📬 New notification received:", newNotification);

      // Add new notification to the top
      setNotifications((prev) => [newNotification, ...prev]);

      // Increase unread count if notification is unread
      if (!newNotification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      // Cleanup: Note - we don't disconnect socket here as it might be used elsewhere
      // Just remove the listener
      console.log("🧹 Cleaning up notification listeners");
    };
  }, [currentUser._id, fetchNotifications, getUnreadCount]);

  const getNotificationIcon = (type) => {
    const icons = {
      connection_request: "🤝",
      request_accepted: "✅",
      request_rejected: "❌",
      skill_added: "⭐",
      post_liked: "❤️",
      comment_added: "💬",
    };
    return icons[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    const colors = {
      connection_request: "bg-blue-50 border-blue-200",
      request_accepted: "bg-green-50 border-green-200",
      request_rejected: "bg-red-50 border-red-200",
      skill_added: "bg-purple-50 border-purple-200",
      post_liked: "bg-pink-50 border-pink-200",
      comment_added: "bg-yellow-50 border-yellow-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔔 Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                You have{" "}
                <span className="font-bold text-blue-600">{unreadCount}</span>{" "}
                unread notifications
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-2xl">⏳</div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-600">No notifications yet!</p>
            <p className="text-sm text-gray-500 mt-2">
              When someone interacts with you, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? "bg-white border-gray-200"
                    : getNotificationColor(notification.type)
                } ${!notification.read ? "border-l-4" : ""} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="text-2xl mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Sender Info */}
                      {notification.sender && (
                        <div
                          className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80"
                          onClick={() =>
                            navigate(`/profile/${notification.sender._id}`)
                          }
                        >
                          <img
                            src={
                              notification.sender.profileImage ||
                              "https://via.placeholder.com/32"
                            }
                            alt={notification.sender.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/32";
                            }}
                          />
                          <p className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                            {notification.sender.name}
                          </p>
                        </div>
                      )}

                      {/* Message */}
                      <p className="text-gray-700 text-sm break-words">
                        {notification.message}
                      </p>

                      {/* Time */}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        {new Date(notification.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
                      >
                        ✓ Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors whitespace-nowrap"
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
