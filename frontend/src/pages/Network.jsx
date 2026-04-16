import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendConnectionRequest, initSocket, getSocket } from "../utils/socketClient";

function Network() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Socket.io
    if (currentUser._id) {
      initSocket(currentUser._id);
    }
  }, [currentUser._id]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/suggested`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Network fetch error:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    load();
  }, []);

  const handleFollow = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await axios.post(`${API}/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Emit socket event for real-time update
      const socket = getSocket();
      if (socket && res.data.followRequest) {
        sendConnectionRequest(currentUser._id, userId, res.data.followRequest._id);
      }

      // Update UI to show request sent
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (err) {
      console.error("Follow request failed:", err);
      alert(err.response?.data?.msg || "Failed to send connection request");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-[#1D2226]">👥 My Network</h1>
        <p className="text-gray-600 mb-6">Discover and connect with professionals</p>

        {/* Suggested Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h2 className="text-xl font-semibold text-[#1D2226]">People you may know</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin text-2xl">⏳</div>
              <p className="mt-2 text-sm text-[#666666]">Loading suggestions...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-[#666666]">You've connected with everyone! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const isFollowing = user.followers?.some(
                  (id) => String(id) === String(currentUser._id)
                );
                const hasSentRequest = user.requestSent;
                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <img
                        src={
                          user.profileImage ||
                          "https://via.placeholder.com/48"
                        }
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#1D2226] hover:text-blue-600">{user.name}</p>
                        <p className="text-xs text-[#666666]">
                          {user.headline || "LinkedIn member"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollow(user._id)}
                      disabled={actionLoading === user._id || isFollowing || hasSentRequest}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        isFollowing
                          ? "bg-gray-200 text-gray-600 cursor-default"
                          : hasSentRequest
                          ? "bg-yellow-100 text-yellow-700 cursor-default border border-yellow-300"
                          : actionLoading === user._id
                          ? "bg-blue-300 text-white"
                          : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                      }`}
                    >
                      {actionLoading === user._id
                        ? "Sending..."
                        : isFollowing
                        ? "✓ Connected"
                        : hasSentRequest
                        ? "⏳ Pending"
                        : "+ Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Network;
