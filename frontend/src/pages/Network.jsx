import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Network() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/users`, {
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
      await axios.post(`${API}/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update UI to show request sent
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (err) {
      console.error("Follow request failed:", err);
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
        <h1 className="text-2xl font-semibold mb-4 text-[#1D2226]">Network</h1>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="bg-white rounded-xl border p-4">
                <h2 className="text-lg font-semibold mb-3 text-[#1D2226]">Follow Requests</h2>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.from?.profileImage || "https://via.placeholder.com/56"}
                          alt={req.from?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-[#1D2226]">{req.from?.name}</p>
                          <p className="text-xs text-[#666666]">{req.from?.headline || "No headline yet."}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req._id)}
                          disabled={actionLoading === req._id}
                          className="bg-[#0A66C2] text-white px-4 py-1 rounded hover:bg-[#004182] disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={actionLoading === req._id}
                          className="border px-4 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3 text-[#1D2226]">People you may know</h2>
              {loading ? (
                <p className="text-sm text-[#666666]">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-[#666666]">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const isFollowing = user.followers?.some(
                      (id) => String(id) === String(currentUser._id)
                    );
                    const hasSentRequest = user.requestSent;
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/profile/${user._id}`)}
                        >
                          <img
                            src={
                              user.profileImage ||
                              "https://via.placeholder.com/56"
                            }
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-[#1D2226]">{user.name}</p>
                            <p className="text-xs text-[#666666]">
                              {user.headline || "No headline yet."}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFollow(user._id)}
                          disabled={actionLoading === user._id || isFollowing || hasSentRequest}
                          className={`px-4 py-1 rounded disabled:opacity-50 ${
                            isFollowing
                              ? "bg-gray-200 text-gray-600"
                              : hasSentRequest
                              ? "bg-[#E7F3FF] text-[#0A66C2]"
                              : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                          }`}
                        >
                          {isFollowing ? "Following" : hasSentRequest ? "Request Sent" : "Follow"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Network;
