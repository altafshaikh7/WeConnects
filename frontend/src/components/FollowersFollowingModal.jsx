import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FollowersFollowingModal = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && userId) {
      fetchFollowersAndFollowing();
    }
  }, [isOpen, userId]);

  const fetchFollowersAndFollowing = async () => {
    try {
      setLoading(true);
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`${API}/api/users/${userId}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/users/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);
    } catch (err) {
      console.error("Error fetching followers/following:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const data = activeTab === "followers" ? followers : following;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === "followers" ? "👥 Followers" : "➡️ Following"}
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
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-2xl">⏳</div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>
                No {activeTab === "followers" ? "followers" : "following"} yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {data.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.headline || "LinkedIn member"}
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 text-lg">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersFollowingModal;
