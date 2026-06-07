import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LeftSidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, API]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded mt-3 mx-auto w-32"></div>
        <div className="h-3 bg-gray-200 rounded mt-2 mx-auto w-24"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500 text-sm">Session expired</p>
        <button 
          onClick={() => navigate("/")}
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          Login again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Cover Photo */}
      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      {/* Profile Info */}
      <div className="text-center px-4 pb-4">
        <img
          src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D8CFF&color=fff&size=80&bold=true`}
          alt="profile"
          className="w-20 h-20 rounded-full mx-auto -mt-10 border-4 border-white shadow-md object-cover"
        />
        
        <h2 className="font-bold text-lg text-gray-900 mt-2">{user.name}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{user.headline || "Add a headline"}</p>
        
        {user.location && (
          <p className="text-xs text-gray-400 mt-1">📍 {user.location}</p>
        )}
        
        <button 
          onClick={() => navigate("/profile")}
          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition"
        >
          View Profile
        </button>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Profile views</span>
            <span className="font-semibold text-gray-900">{user.profileViews?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Post impressions</span>
            <span className="font-semibold text-gray-900">{user.postImpressions?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Connections</span>
            <span className="font-semibold text-gray-900">{user.connections?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="border-t border-gray-100">
        <button 
          onClick={() => navigate("/settings")}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings & Privacy</span>
        </button>
        
      

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 text-center text-[10px] text-gray-400 border-t border-gray-100">
        <p>© 2024 LinkedIn Clone</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="cursor-pointer hover:text-gray-600">About</span>
          <span>•</span>
          <span className="cursor-pointer hover:text-gray-600">Help</span>
          <span>•</span>
          <span className="cursor-pointer hover:text-gray-600">Privacy</span>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;