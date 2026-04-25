import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UnfollowModal from "./UnfollowModal";

const FollowersFollowingModal = ({ userId, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unfollowUser, setUnfollowUser] = useState(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwnProfile = String(userId) === String(currentUser._id);

  useEffect(() => {
    if (isOpen && userId) {
      fetchData();
    }
  }, [isOpen, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`${API}/users/${userId}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/users/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
      
      // Fetch pending requests only for own profile
      if (isOwnProfile) {
        const pendingRes = await axios.get(`${API}/users/requests/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(pendingRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, fromUserId) => {
    try {
      await axios.post(`${API}/users/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Refresh data to update followers/following
      await fetchData();
      
      // Call parent update callback if provided
      if (onUpdate) onUpdate();
      
      alert("Connection request accepted!");
    } catch (err) {
      console.error("Accept failed:", err);
      alert(err.response?.data?.msg || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`${API}/users/requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      
      if (onUpdate) onUpdate();
      
      alert("Request rejected");
    } catch (err) {
      console.error("Reject failed:", err);
      alert(err.response?.data?.msg || "Failed to reject request");
    }
  };

  if (!isOpen) return null;

  const data = activeTab === "followers" ? followers : 
               activeTab === "following" ? following : pendingRequests;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === "followers" && "👥 Followers"}
            {activeTab === "following" && "➡️ Following"}
            {activeTab === "pending" && "⏳ Pending Requests"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "followers"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "following"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Following ({following.length})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === "pending" ? (
            pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending requests
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer" 
                      onClick={() => {
                        navigate(`/profile/${request.from._id}`);
                        onClose();
                      }}
                    >
                      <img
                        src={request.from.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.from.name)}&background=0A66C2&color=fff`}
                        alt={request.from.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{request.from.name}</p>
                        <p className="text-xs text-gray-500">{request.from.headline || "Wants to connect"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id, request.from._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab === "followers" ? "followers" : "following"} yet
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {data.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${user._id}`);
                      onClose();
                    }}
                  >
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0A66C2&color=fff`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.headline || "Member"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Unfollow button for Following tab */}
                  {activeTab === "following" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnfollowUser(user);
                      }}
                      className="text-red-500 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    >
                      Unfollow
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unfollow Modal */}
      {unfollowUser && (
        <UnfollowModal
          user={unfollowUser}
          onUnfollow={(userId) => {
            setFollowing(following.filter((u) => u._id !== userId));
            setUnfollowUser(null);
            fetchData();
            if (onUpdate) onUpdate();
          }}
          onCancel={() => setUnfollowUser(null)}
        />
      )}
    </div>
  );
};

export default FollowersFollowingModal;