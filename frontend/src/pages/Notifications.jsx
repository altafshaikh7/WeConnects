import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { onReceiveNotification, initSocket } from "../utils/socketClient";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Initialize Socket.io
    if (currentUser._id) {
      initSocket(currentUser._id);
    }

    fetchNotifications();
    getUnreadCount();

    // Listen for real-time notifications
    onReceiveNotification((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  }, [currentUser._id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      getUnreadCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read/all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      getUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "connection_request":
        return "🤝";
      case "request_accepted":
        return "✅";
      case "request_rejected":
        return "❌";
      case "skill_added":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "connection_request":
        return "bg-blue-50 border-blue-200";
      case "request_accepted":
        return "bg-green-50 border-green-200";
      case "request_rejected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
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
                You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notifications
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

        {/* Notifications List */}
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
                  notification.read ? "bg-white border-gray-200" : getNotificationColor(notification.type)
                } ${!notification.read ? "border-l-4" : ""} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="text-2xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Sender Info */}
                          {notification.sender && (
                            <div
                              className="flex items-center gap-2 mb-2 cursor-pointer"
                              onClick={() => navigate(`/profile/${notification.sender._id}`)}
                            >
                              <img
                                src={notification.sender.profileImage}
                                alt={notification.sender.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <p className="font-semibold text-gray-900 hover:text-blue-600">
                                {notification.sender.name}
                              </p>
                            </div>
                          )}

                          {/* Message */}
                          <p className="text-gray-700 text-sm">
                            {notification.message}
                          </p>

                          {/* Time */}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}{" "}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        ✓ Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
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
