import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserPlus, UserCheck, Clock, Users, RefreshCw, Search, X } from "lucide-react";
import { sendConnectionRequest, initSocket, getSocket } from "../utils/socketClient";

function Network() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

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
    if (currentUser._id) {
      initSocket(currentUser._id);
    }
    fetchUsers();
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleConnect = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await axios.post(`${API}/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const socket = getSocket();
      if (socket && res.data.followRequest) {
        sendConnectionRequest(currentUser._id, userId, res.data.followRequest._id);
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, requestSent: true } : user
        )
      );
      
      alert(`Connection request sent to ${res.data.name || 'user'}`);
    } catch (err) {
      console.error("Connect request failed:", err);
      alert(err.response?.data?.msg || "Failed to send connection request");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    String(user._id) !== String(currentUser._id) && (
      searchTerm === "" || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.headline?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          
          {/* Header - Responsive */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Network</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Connect with professionals</p>
          </div>

          {/* Search Bar - Responsive */}
          <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 mb-3 sm:mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Refresh Button - Responsive */}
          <div className="flex justify-end mb-3 sm:mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Users List - Responsive Cards */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
              <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">Loading suggestions...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
              <Users size={32} className="sm:w-10 sm:h-10 mx-auto text-gray-300 mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-600">No users found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-blue-600 text-xs sm:text-sm hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredUsers.map((user) => {
                const isConnected = user.followers?.some(
                  (id) => String(id) === String(currentUser._id)
                );
                const hasSentRequest = user.requestSent;
                
                return (
                  <div
                    key={user._id}
                    className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Profile Image - Responsive */}
                      <div
                        className="flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${user._id}`)}
                      >
                        <img
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0A66C2&color=fff&size=48`}
                          alt={user.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      </div>
                      
                      {/* User Info - Responsive Text */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${user._id}`)}
                      >
                        <p className="font-semibold text-gray-900 hover:text-blue-600 text-sm sm:text-base truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {user.headline || "No headline"}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1 hidden sm:block">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {/* Connect Button - Responsive */}
                      <button
                        onClick={() => handleConnect(user._id)}
                        disabled={actionLoading === user._id || isConnected || hasSentRequest}
                        className={`
                          flex-shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all
                          ${isConnected
                            ? "bg-gray-100 text-gray-500 cursor-default"
                            : hasSentRequest
                            ? "bg-yellow-50 text-yellow-600 cursor-default border border-yellow-200"
                            : actionLoading === user._id
                            ? "bg-gray-200 text-gray-400 cursor-wait"
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                          }
                        `}
                      >
                        {actionLoading === user._id ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Sending...</span>
                          </span>
                        ) : isConnected ? (
                          "✓"
                        ) : hasSentRequest ? (
                          "⏳"
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserPlus size={12} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Connect</span>
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Bio for mobile - below the card */}
                    {user.bio && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 sm:hidden">
                        {user.bio}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Results Count - Responsive */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs text-gray-500">
                Showing {filteredUsers.length} of {users.length} suggestions
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Network;