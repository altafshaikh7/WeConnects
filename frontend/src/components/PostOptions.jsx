import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MoreHorizontal, Trash2, UserX, Link2, Flag, Edit } from "lucide-react";
import UnfollowModal from "./UnfollowModal";

const PostOptions = ({ post, onDelete, currentUserId, onUnfollow, onCopyLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  const isOwner = String(post?.user?._id) === String(currentUserId);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    
    // Use toast if available, otherwise alert
    if (window.toast) {
      window.toast.success("Link copied to clipboard!");
    } else {
      alert("Link copied to clipboard!");
    }
    
    setIsOpen(false);
    if (onCopyLink) onCopyLink(post._id);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Use toast if available
      if (window.toast) {
        window.toast.success("Post deleted successfully");
      } else {
        alert("Post deleted ✅");
      }
      
      onDelete(post._id);
      setIsOpen(false);
    } catch (err) {
      console.error("Error deleting post:", err);
      if (window.toast) {
        window.toast.error("Failed to delete post");
      } else {
        alert("Failed to delete post ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowClick = () => {
    setIsOpen(false);
    setShowUnfollowModal(true);
  };

  const handleConfirmUnfollow = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/users/unfollow`,
        { userId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Use toast if available
      if (window.toast) {
        window.toast.success(`Unfollowed ${post?.user?.name}`);
      } else {
        alert(`Unfollowed ${post?.user?.name} ✅`);
      }
      
      setShowUnfollowModal(false);
      
      // Call parent callback to refresh feed
      if (onUnfollow) {
        onUnfollow(userId);
      }
    } catch (err) {
      console.error("Error unfollowing:", err);
      if (window.toast) {
        window.toast.error("Failed to unfollow");
      } else {
        alert("Failed to unfollow ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    setIsOpen(false);
    if (window.toast) {
      window.toast.success("Thank you for reporting. Our team will review it.");
    } else {
      alert("Thank you for reporting. Our team will review it.");
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex items-center justify-center"
          aria-label="Post options"
          title="More options"
          disabled={loading}
        >
          <MoreHorizontal size={20} className="text-gray-600 hover:text-gray-900" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
            {/* Copy Link - Always visible */}
            <button
              onClick={handleCopyLink}
              disabled={loading}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-all duration-200 disabled:opacity-50 group"
            >
              <Link2 size={18} className="text-gray-500 group-hover:text-blue-600" />
              <span className="text-sm font-medium">Copy link</span>
            </button>

            {/* Edit Post - Only for owner */}
            {isOwner && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  // You can implement edit functionality here
                  if (window.toast) {
                    window.toast.info("Edit feature coming soon");
                  } else {
                    alert("Edit post feature coming soon");
                  }
                }}
                disabled={loading}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center gap-3 border-t border-gray-100 transition-all duration-200 disabled:opacity-50 group"
              >
                <Edit size={18} className="text-gray-500 group-hover:text-green-600" />
                <span className="text-sm font-medium">Edit post</span>
              </button>
            )}

            {/* Delete Post - Only for owner */}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 border-t border-gray-100 transition-all duration-200 disabled:opacity-50 group"
              >
                <Trash2 size={18} className="text-red-500 group-hover:text-red-600" />
                <span className="text-sm font-medium">{loading ? "Deleting..." : "Delete post"}</span>
              </button>
            )}

            {/* Unfollow Option - Only for non-owners */}
            {!isOwner && (
              <button
                onClick={handleUnfollowClick}
                disabled={loading}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 text-orange-600 flex items-center gap-3 border-t border-gray-100 transition-all duration-200 disabled:opacity-50 group"
              >
                <UserX size={18} className="text-orange-500 group-hover:text-orange-600" />
                <span className="text-sm font-medium">Unfollow {post?.user?.name}</span>
              </button>
            )}

            {/* Report Post - Only for non-owners */}
            {!isOwner && (
              <button
                onClick={handleReport}
                disabled={loading}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 border-t border-gray-100 transition-all duration-200 disabled:opacity-50 group"
              >
                <Flag size={18} className="text-red-500 group-hover:text-red-600" />
                <span className="text-sm font-medium">Report post</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Unfollow Modal */}
      {showUnfollowModal && (
        <UnfollowModal
          user={post.user}
          onUnfollow={handleConfirmUnfollow}
          onCancel={() => setShowUnfollowModal(false)}
        />
      )}
    </>
  );
};

export default PostOptions;