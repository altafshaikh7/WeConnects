import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  initSocket,
  onReceiveNotification,
  getSocket,
  disconnectSocket,
} from "../utils/socketClient";
import { X, Check, Trash2 } from "lucide-react";

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
    if (!token) return;
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
    if (!token) return;
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
      if (!token) return;
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
    if (!token) return;
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
      if (!token) return;
      try {
        await axios.delete(`${API}/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );

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
    // 🔐 SAFE AUTH CHECK: Validate token and user data
    if (!token || !currentUser?._id) {
      console.warn("❌ Auth check failed. Token:", !!token, "User ID:", currentUser?._id);
      // Only redirect if no token AND no user data
      if (!token && !currentUser?._id) {
        navigate("/", { replace: true });
      }
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
      console.log("🧹 Cleaning up notification listeners");
    };
  }, [currentUser._id, fetchNotifications, getUnreadCount, navigate]);

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
      connection_request: "bg-blue-50 border-l-4 border-l-blue-500",
      request_accepted: "bg-green-50 border-l-4 border-l-green-500",
      request_rejected: "bg-red-50 border-l-4 border-l-red-500",
      skill_added: "bg-purple-50 border-l-4 border-l-purple-500",
      post_liked: "bg-pink-50 border-l-4 border-l-pink-500",
      comment_added: "bg-yellow-50 border-l-4 border-l-yellow-500",
    };
    return colors[type] || "bg-gray-50 border-l-4 border-l-gray-500";
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-bold text-[#0A66C2]">{unreadCount}</span> unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-[#0A66C2] text-white px-5 py-2 rounded-lg hover:bg-[#0952A4] transition-colors font-semibold"
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
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="inline-block animate-spin">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-[#0A66C2] rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-lg font-semibold text-gray-700">No notifications yet!</p>
            <p className="text-sm text-gray-500 mt-2">
              When someone interacts with you, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  notification.read
                    ? "bg-white border-gray-200"
                    : getNotificationColor(notification.type)
                } ${!notification.read ? "shadow-sm" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Sender Info */}
                      {notification.sender && (
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={
                              notification.sender.profileImage ||
                              "https://via.placeholder.com/32"
                            }
                            alt={notification.sender.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 ring-[#0A66C2]"
                            onClick={() =>
                              navigate(`/profile/${notification.sender._id}`)
                            }
                          />
                          <p
                            className="font-semibold text-gray-900 hover:text-[#0A66C2] cursor-pointer truncate text-sm"
                            onClick={() =>
                              navigate(`/profile/${notification.sender._id}`)
                            }
                          >
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
                        at{" "}
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
                      <div className="w-3 h-3 bg-[#0A66C2] rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete"
                      className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
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
