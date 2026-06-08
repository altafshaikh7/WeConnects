import { useEffect, useState } from "react";
import axios from "axios";
import UnfollowModal from "./UnfollowModal";
import { UserPlus, Clock, UserCheck } from "lucide-react";

function FollowButton({ user, isFollowing, onFollowChange, isMutualFollower = false }) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [followStatus, setFollowStatus] = useState(isFollowing ? "following" : "not-following");
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  useEffect(() => {
    setFollowStatus(isFollowing ? "following" : "not-following");
  }, [isFollowing]);

  if (String(user?._id) === String(currentUser?._id) || isMutualFollower) {
    return null;
  }

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

      const nextStatus = response.data?.status === "accepted" ? "following" : "pending";
      setFollowStatus(nextStatus);
      onFollowChange?.(nextStatus === "following");
      alert(nextStatus === "following" ? `You are now following ${user.name}` : `Follow request sent to ${user.name}`);
    } catch (err) {
      console.error("Follow failed:", err);
      setFollowStatus(isFollowing ? "following" : "not-following");
      alert(err.response?.data?.msg || "Failed to send follow request");
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
      setShowUnfollowModal(false);
      onFollowChange?.(false);
      alert(`Unfollowed ${user.name}`);
    } catch (err) {
      console.error("Unfollow failed:", err);
      alert(err.response?.data?.msg || "Failed to unfollow");
    } finally {
      setLoading(false);
    }
  };

  const getButtonConfig = () => {
    switch (followStatus) {
      case "following":
        return {
       
      case "pending":
        return {
          text: "Pending",
          icon: <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />,
          className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-wait",
        };
      default:
        return {
          text: loading ? "..." : "Follow",
          icon: <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />,
          className: "bg-blue-500 text-white hover:bg-blue-600",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  if (followStatus === "following") {
    return (
      <>
        <button
          onClick={() => setShowUnfollowModal(true)}
          disabled={loading}
          className={`flex items-center gap-1 sm:gap-2 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:scale-105 ${buttonConfig.className}`}
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

  return (
    <button
      onClick={followStatus === "pending" ? undefined : handleFollow}
      disabled={loading || followStatus === "pending"}
      className={`flex items-center gap-1 sm:gap-2 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:scale-105 ${buttonConfig.className}`}
      title={followStatus === "pending" ? "Request pending" : "Click to follow"}
    >
      {buttonConfig.icon}
      <span>{buttonConfig.text}</span>
    </button>
  );
}

export default FollowButton;
