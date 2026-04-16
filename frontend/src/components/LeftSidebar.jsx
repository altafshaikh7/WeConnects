import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LeftSidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching profile from:", `${API}/profile`);
        console.log("Token:", token ? "✓ Present" : "✗ Missing");

        const res = await axios.get(`${API}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        });

        console.log("Profile fetched successfully:", res.data);
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error("Profile fetch ERROR:", err.message);
        console.error("Full error:", err);
        
        let errorMsg = "Failed to load profile";
        if (err.response?.status === 401) {
          errorMsg = "Authentication failed";
        } else if (err.response?.status === 404) {
          errorMsg = "Profile not found";
        } else if (err.code === "ECONNABORTED") {
          errorMsg = "Request timeout";
        } else if (!navigator.onLine) {
          errorMsg = "No internet connection";
        }
        
        setError(errorMsg);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, API]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow text-center animate-pulse">
        <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-gray-200"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow text-center border border-red-200">
        <p className="text-red-600 text-sm mb-2">⚠️ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-gray-500 text-sm">No user data available</p>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate("/profile")}
      className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition"
    >
      <img
        src={
          user.profileImage ||
          "https://via.placeholder.com/80"
        }
        alt="profile"
        className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
      />

      <h2 className="font-semibold text-base">{user.name}</h2>

      <p className="text-xs text-gray-500">
        {user.headline || "Add headline"}
      </p>

      <hr className="my-3" />

      <div className="text-sm text-gray-600 space-y-1">
        <p>Profile viewers {user.profileViews || 0}</p>
        <p>Post impressions {user.postImpressions || 0}</p>
      </div>
    </div>
  );
}

export default LeftSidebar;