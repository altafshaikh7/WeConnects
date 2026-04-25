import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ USER API ============

export const userAPI = {
  // Get all users (excluding current user)
  getAllUsers: () => apiClient.get("/users"),

  // Get suggested users to connect with
  getSuggestedUsers: () => apiClient.get("/users/suggested"),

  // Get user by ID
  getUserById: (userId) => apiClient.get(`/users/${userId}`),

  // Get followers of a user
  getFollowers: (userId) => apiClient.get(`/users/${userId}/followers`),

  // Get following of a user
  getFollowing: (userId) => apiClient.get(`/users/${userId}/following`),

  // Get connection status (following, pending, etc.)
  getConnectionStatus: (userId) => apiClient.get(`/users/${userId}/connection-status`),

  // Send follow request
  followUser: (userId) => apiClient.post(`/users/${userId}/follow`),

  // Unfollow user
  unfollowUser: (userId) => apiClient.post(`/users/${userId}/unfollow`),

  // Add skill
  addSkill: (skill) => apiClient.post("/users/skills/add", { skill }),

  // Remove skill
  removeSkill: (skill) => apiClient.post("/users/skills/remove", { skill }),

  // Get pending follow requests
  getPendingRequests: () => apiClient.get("/users/requests/pending"),

  // Accept follow request
  acceptRequest: (requestId) => apiClient.post(`/users/requests/${requestId}/accept`),

  // Reject follow request
  rejectRequest: (requestId) => apiClient.post(`/users/requests/${requestId}/reject`),
};

// ============ NOTIFICATION API ============

export const notificationAPI = {
  // Get all notifications
  getNotifications: () => apiClient.get("/notifications"),

  // Get unread count
  getUnreadCount: () => apiClient.get("/notifications/unread/count"),

  // Mark notification as read
  markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),

  // Mark all as read
  markAllAsRead: () => apiClient.put("/notifications/read/all"),

  // Delete notification
  deleteNotification: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
};

// ============ SEARCH API ============

export const searchAPI = {
  // Search users by name or email
  searchUsers: (query) => apiClient.get(`/search/users?query=${query}`),

  // Add comment to post
  addComment: (postId, text) => apiClient.post(`/search/posts/${postId}/comments`, { text }),

  // Get comments for a post
  getComments: (postId) => apiClient.get(`/search/posts/${postId}/comments`),

  // Delete comment
  deleteComment: (postId, commentId) => apiClient.delete(`/search/posts/${postId}/comments/${commentId}`),

  // Add reply to comment
  addReply: (postId, commentId, text) => apiClient.post(`/search/posts/${postId}/comments/${commentId}/replies`, { text }),

  // Track profile view
  trackProfileView: (userId) => apiClient.post(`/search/users/${userId}/track-view`),
};

export default apiClient;
