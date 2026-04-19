import { useState } from "react";
import axios from "axios";
import UnfollowModal from "./UnfollowModal";
import { UserPlus, UserMinus, Clock, UserCheck } from "lucide-react";

function FollowButton({ user, isFollowing, onFollowChange, isMutualFollower = false }) {
  const [loading, setLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [followStatus, setFollowStatus] = useState(isFollowing ? "following" : "not-following");
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleFollow = async () => {
    setLoading(true);
    setFollowStatus("pending");
    
    try {
      const response = await axios.post(
        `${API}/users/${user._id}/follow`, 
        {},
        { headers: getAuthHeader() }
      );
      
      // Check if it's an instant follow or pending request
      if (response.data.status === "accepted" || response.data.isFollowing) {
        setFollowStatus("following");
        // Use toast or alert
        if (window.toast) {
          window.toast.success(`You are now following ${user.name}`);
        } else {
          alert(`You are now following ${user.name} ✅`);
        }
      } else {
        setFollowStatus("pending");
        if (window.toast) {
          window.toast.success(`Follow request sent to ${user.name}`);
        } else {
          alert(`Follow request sent to ${user.name} ✅`);
        }
      }
      
      if (onFollowChange) {
        onFollowChange(true);
      }
    } catch (err) {
      console.error("Follow failed:", err);
      setFollowStatus(isFollowing ? "following" : "not-following");
      if (window.toast) {
        window.toast.error(err.response?.data?.msg || "Failed to send follow request");
      } else {
        alert(err.response?.data?.msg || "Failed to send follow request");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setLoading(true);
    try {
      await axios.post(
        `${API}/users/${userId}/unfollow`, 
        {},
        { headers: getAuthHeader() }
      );
      
      setFollowStatus("not-following");
      
      if (window.toast) {
        window.toast.success(`Unfollowed ${user.name}`);
      } else {
        alert(`Unfollowed ${user.name} ✅`);
      }
      
      setShowUnfollowModal(false);
      
      if (onFollowChange) {
        onFollowChange(false);
      }
    } catch (err) {
      console.error("Unfollow failed:", err);
      if (window.toast) {
        window.toast.error(err.response?.data?.msg || "Failed to unfollow");
      } else {
        alert("Failed to unfollow");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔴 HIDE BUTTON: If already mutually following (connected)
  if (isMutualFollower) {
    return null;
  }

  // Get button text and style based on status
  const getButtonConfig = () => {
    switch (followStatus) {
      case "following":
        return {
          text: "Following",
          icon: <UserCheck size={16} className="sm:w-[18px] sm:h-[18px]" />,
          className: "bg-gray-200 text-gray-700 hover:bg-gray-300"
        };
      case "pending":
        return {
          text: "Pending",
          icon: <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />,
          className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-wait"
        };
      default:
        return {
          text: loading ? "..." : "Follow",
          icon: <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />,
          className: "bg-blue-500 text-white hover:bg-blue-600"
        };
    }
  };

  const buttonConfig = getButtonConfig();

  // Following button with unfollow modal
  if (followStatus === "following") {
    return (
      <>
        <button
          onClick={() => setShowUnfollowModal(true)}
          disabled={loading}
          className={`
            flex items-center gap-1 sm:gap-2
            px-2 py-1 text-xs
            sm:px-4 sm:py-2 sm:text-sm
            rounded-lg font-medium
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            whitespace-nowrap
            hover:scale-105
            ${buttonConfig.className}
          `}
          title="Click to unfollow"
        >
          {buttonConfig.icon}
          <span>{buttonConfig.text}</span>
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

  // Follow or Pending button
  return (
    <button
      onClick={followStatus === "pending" ? undefined : handleFollow}
      disabled={loading || followStatus === "pending"}
      className={`
        flex items-center gap-1 sm:gap-2
        px-2 py-1 text-xs
        sm:px-4 sm:py-2 sm:text-sm
        rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        whitespace-nowrap
        hover:scale-105
        ${buttonConfig.className}
      `}
      title={followStatus === "pending" ? "Request pending" : "Click to follow"}
    >
      {buttonConfig.icon}
      <span>{buttonConfig.text}</span>
    </button>
  );
}

export default FollowButton;