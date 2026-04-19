import { useState } from "react";
import axios from "axios";
import { UserX, AlertCircle, Loader2 } from "lucide-react";

function UnfollowModal({ user, onUnfollow, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  const handleUnfollow = async () => {
    if (loading) return;
    
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/users/${user._id}/unfollow`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Call parent callback with user ID to remove posts
      if (onUnfollow) {
        onUnfollow(user._id);
      }
      
      // Optional: Show success message
      if (window.toast) {
        window.toast.success(`Unfollowed ${user?.name}`);
      }
    } catch (err) {
      console.error("Unfollow failed:", err);
      setError(err.response?.data?.message || "Failed to unfollow. Please try again.");
      
      if (window.toast) {
        window.toast.error(err.response?.data?.message || "Failed to unfollow");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserX size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                Unfollow {user?.name}?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                You will no longer see posts from {user?.name} in your feed.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="px-6 pt-4">
          <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Their posts will be removed from your feed immediately. You can follow them again later.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUnfollow}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Unfollowing...</span>
              </>
            ) : (
              <>
                <UserX size={16} />
                <span>Unfollow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnfollowModal;