import { useState } from "react";
import axios from "axios";
import UnfollowModal from "./UnfollowModal";
import { UserPlus, UserMinus } from "lucide-react";

function FollowButton({ user, isFollowing, onFollowChange }) {
  const [loading, setLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  const handleFollow = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/users/${user._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Follow request sent ✅");
      if (onFollowChange) {
        onFollowChange(true);
      }
    } catch (err) {
      console.error("Follow failed:", err);
      alert(err.response?.data?.msg || "Failed to send follow request");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setLoading(true);
    try {
      await axios.post(`${API}/users/${userId}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Unfollowed ✅");
      setShowUnfollowModal(false);
      if (onFollowChange) {
        onFollowChange(false);
      }
    } catch (err) {
      console.error("Unfollow failed:", err);
      alert("Failed to unfollow");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FOLLOWING BUTTON
  if (isFollowing) {
    return (
      <>
        <button
          onClick={() => setShowUnfollowModal(true)}
          disabled={loading}
          className="
            flex items-center gap-1 sm:gap-2
            px-2 py-1 text-xs
            sm:px-4 sm:py-2 sm:text-sm
            rounded-lg bg-gray-200 text-gray-700 font-medium
            hover:bg-gray-300 transition disabled:opacity-50
            whitespace-nowrap
          "
        >
          <UserMinus size={16} className="sm:w-[18px] sm:h-[18px]" />
          Following
        </button>

        {showUnfollowModal && (
          <UnfollowModal
            user={user}
            onUnfollow={handleUnfollow}
            onCancel={() => setShowUnfollowModal(false)}
          />
        )}
      </>
    );
  }

  // ✅ FOLLOW BUTTON
  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className="
        flex items-center gap-1 sm:gap-2
        px-2 py-1 text-xs
        sm:px-4 sm:py-2 sm:text-sm
        rounded-lg bg-blue-500 text-white font-medium
        hover:bg-blue-600 transition disabled:opacity-50
        whitespace-nowrap
      "
    >
      <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
      {loading ? "..." : "Follow"}
    </button>
  );
}

export default FollowButton;