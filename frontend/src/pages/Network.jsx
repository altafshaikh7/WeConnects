import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendConnectionRequest, initSocket, getSocket } from "../utils/socketClient";

function Network() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
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
      const res = await axios.get(`${API}/api/users/suggested`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Network fetch error:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/users/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Requests fetch error:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRequests()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleFollow = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await axios.post(`${API}/api/users/${userId}/follow`, {}, {
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

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      await axios.post(`${API}/api/users/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      fetchUsers(); // Refresh users to update counts
    } catch (err) {
      console.error("Accept failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await axios.post(`${API}/api/users/requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2 text-[#1D2226]">👥 My Network</h1>
        <p className="text-gray-600 mb-6">Discover and connect with professionals in your network</p>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📬</span>
                  <h2 className="text-xl font-semibold text-[#1D2226]">Connection Requests</h2>
                  <span className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {requests.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/profile/${req.from?._id}`)}
                      >
                        <img
                          src={req.from?.profileImage || "https://via.placeholder.com/56"}
                          alt={req.from?.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                        />
                        <div>
                          <p className="font-semibold text-[#1D2226] hover:text-blue-600">{req.from?.name}</p>
                          <p className="text-sm text-[#666666]">{req.from?.headline || "LinkedIn member"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req._id)}
                          disabled={actionLoading === req._id}
                          className="bg-[#0A66C2] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#004182] disabled:opacity-50 transition-colors"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={actionLoading === req._id}
                          className="border border-gray-300 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💡</span>
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

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#1D2226] mb-4">📊 Your Network Stats</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="text-sm text-[#666666]">Pending Requests</p>
                  <p className="text-2xl font-bold text-[#1D2226]">{requests.length}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="text-sm text-[#666666]">Suggestions Available</p>
                  <p className="text-2xl font-bold text-[#1D2226]">{users.length}</p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setLoading(true);
                Promise.all([fetchUsers(), fetchRequests()]).then(() => setLoading(false));
              }}
              className="w-full bg-[#0A66C2] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#004182] transition-colors flex items-center justify-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Network;
