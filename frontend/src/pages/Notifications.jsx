import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  initSocket,
  onReceiveNotification,
} from "../utils/socketClient";
import { 
  X, 
  Check, 
  Trash2, 
  Bell, 
  UserPlus, 
  UserCheck, 
  ThumbsUp, 
  MessageCircle, 
  Star,
  Clock,
  RefreshCw,
  Filter,
  AlertCircle
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  
  // Get token and user from localStorage with error handling
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let currentUser = {};
  
  try {
    currentUser = userStr ? JSON.parse(userStr) : {};
  } catch (e) {
    console.error("Error parsing user data:", e);
    currentUser = {};
  }

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      console.log("No token found in localStorage");
      setLoading(false);
      setError("Please login to view notifications");
      return;
    }
    
    try {
      setError("");
      console.log("Fetching notifications with token:", token.substring(0, 20) + "...");
      
      const res = await axios.get(`${API}/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
      });
      
      console.log("Notifications fetched successfully:", res.data?.length || 0);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMsg = "Failed to load notifications.";
      if (err.response?.status === 401) {
        errorMsg = "Session expired. Please login again.";
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/"), 2000);
      } else if (err.code === "ECONNABORTED") {
        errorMsg = "Request timeout. Please check your connection.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message === "Network Error") {
        errorMsg = "Network error. Please check if server is running.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API, token, navigate]);

  // Fetch unread count from API
  const getUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      setUnreadCount(res.data.unreadCount || 0);
      console.log("Unread count:", res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [API, token]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    await getUnreadCount();
  };

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
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
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, [API, token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await axios.put(`${API}/notifications/read/all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, [API, token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token) return;
    try {
      await axios.delete(`${API}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );

      getUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, [API, token, getUnreadCount]);

  // Initialize socket and fetch data on component mount
  useEffect(() => {
    let unsubscribe = () => {};

    console.log("=== NOTIFICATIONS PAGE LOADED ===");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!currentUser?._id);
    console.log("User ID:", currentUser?._id);
    
    // Always try to fetch notifications if token exists
    if (token) {
      fetchNotifications();
      getUnreadCount();

      // Initialize Socket.io only if we have user ID
      if (currentUser?._id) {
        try {
          console.log("Initializing Socket.io for user:", currentUser._id);
          initSocket(currentUser._id);
          
          unsubscribe = onReceiveNotification((newNotification) => {
            console.log("New notification received:", newNotification);
            setNotifications((prev) => {
              const exists = prev.some((item) => item._id === newNotification._id);
              return exists ? prev : [newNotification, ...prev];
            });
            if (!newNotification.read) {
              setUnreadCount((prev) => prev + 1);
            }
          });
        } catch (err) {
          console.error("Socket initialization error:", err);
        }
      }
    } else {
      console.log("No token found - showing login error");
      setLoading(false);
      setError("Please login to view notifications");
    }

    return () => {
      unsubscribe();
    };
  }, [currentUser?._id, fetchNotifications, getUnreadCount, token]);

  const getNotificationIcon = (type) => {
    const icons = {
      connection_request: <UserPlus size={20} />,
      request_accepted: <UserCheck size={20} />,
      request_rejected: <X size={20} />,
      skill_added: <Star size={20} />,
      post_liked: <ThumbsUp size={20} />,
      comment_added: <MessageCircle size={20} />,
      message_received: <MessageCircle size={20} />,
    };
    return icons[type] || <Bell size={20} />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      connection_request: "text-blue-600 bg-blue-100",
      request_accepted: "text-green-600 bg-green-100",
      request_rejected: "text-red-600 bg-red-100",
      skill_added: "text-purple-600 bg-purple-100",
      post_liked: "text-pink-600 bg-pink-100",
      comment_added: "text-yellow-600 bg-yellow-100",
      message_received: "text-indigo-600 bg-indigo-100",
    };
    return colors[type] || "text-gray-600 bg-gray-100";
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }
    return "Just now";
  };

  const filterOptions = [
    { id: "all", label: "All", icon: <Bell size={16} /> },
    { id: "connection_request", label: "Connections", icon: <UserPlus size={16} /> },
    { id: "post_liked", label: "Likes", icon: <ThumbsUp size={16} /> },
    { id: "comment_added", label: "Comments", icon: <MessageCircle size={16} /> },
  ];

  const filteredNotifications = selectedType === "all" 
    ? notifications 
    : notifications.filter(n => n.type === selectedType);

  // If no token, show login prompt immediately
  if (!token) {
    return (
      <div className="bg-[#F3F2EF] min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <p className="text-xl font-semibold text-gray-700">Please Login First</p>
            <p className="text-sm text-gray-500 mt-2">
              You need to be logged in to view your notifications.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-[#0A66C2] text-white px-6 py-2 rounded-lg hover:bg-[#0952A4] transition-all font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell size={32} className="text-[#0A66C2]" />
                Notifications
              </h1>
              {unreadCount > 0 && !loading && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0A66C2] rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-[#0A66C2]">{unreadCount}</span> unread {unreadCount === 1 ? "notification" : "notifications"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
              
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm md:hidden"
                >
                  <Filter size={16} />
                  Filter
                </button>
              )}
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 bg-[#0A66C2] text-white px-5 py-2 rounded-lg hover:bg-[#0952A4] transition-all font-medium shadow-sm"
                >
                  <Check size={18} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs - Desktop */}
        {!loading && notifications.length > 0 && (
          <div className="mb-6 hidden md:block">
            <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedType(option.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                    selectedType === option.id
                      ? "bg-[#0A66C2] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.icon}
                  {option.label}
                  {option.id !== "all" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedType === option.id ? "bg-white text-[#0A66C2]" : "bg-gray-200 text-gray-600"
                    }`}>
                      {notifications.filter(n => n.type === option.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs - Mobile Dropdown */}
        {showFilter && !loading && notifications.length > 0 && (
          <div className="mb-6 md:hidden">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedType(option.id);
                    setShowFilter(false);
                  }}
                  className={`flex items-center justify-between w-full gap-2 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                    selectedType === option.id
                      ? "bg-[#0A66C2] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </div>
                  {option.id !== "all" && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedType === option.id ? "bg-white text-[#0A66C2]" : "bg-gray-200 text-gray-600"
                    }`}>
                      {notifications.filter(n => n.type === option.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="flex-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-red-700 hover:text-red-900 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0A66C2] rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading your notifications...</p>
            <p className="text-xs text-gray-400 mt-2">Please wait while we fetch your updates</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={40} className="text-[#0A66C2]" />
            </div>
            <p className="text-xl font-semibold text-gray-700">No notifications yet!</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              When someone sends you a connection request, likes your post, or comments, you'll see it here.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-6 text-[#0A66C2] hover:underline text-sm font-medium inline-flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Notification Count Summary */}
            <div className="bg-white rounded-lg px-4 py-2 text-sm text-gray-500 border border-gray-100">
              Showing {filteredNotifications.length} {filteredNotifications.length === 1 ? "notification" : "notifications"}
              {selectedType !== "all" && ` in ${selectedType.replace("_", " ")}`}
            </div>
            
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`group bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  notification.read ? "border-gray-100" : "border-l-4 border-l-[#0A66C2] bg-blue-50/30"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Sender Info */}
                      {notification.sender && (
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={
                              notification.sender.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender.name || 'User')}&background=0A66C2&color=fff&bold=true`
                            }
                            alt={notification.sender.name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 ring-[#0A66C2] transition-all"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender?.name || 'User')}&background=0A66C2&color=fff&bold=true`;
                            }}
                            onClick={() => navigate(`/profile/${notification.sender._id}`)}
                          />
                          <div className="flex-1">
                            <p
                              className="font-semibold text-gray-900 hover:text-[#0A66C2] cursor-pointer text-sm"
                              onClick={() => navigate(`/profile/${notification.sender._id}`)}
                            >
                              {notification.sender.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock size={12} className="text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          title="Mark as read"
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        title="Delete"
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
