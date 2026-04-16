import { useState, useRef } from "react";
import EditProfileModal from "./EditProfileModal";
import FollowersFollowingModal from "./FollowersFollowingModal";
import axios from "axios";

function ProfileCard({ user, refreshProfile, isOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(false);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const token = localStorage.getItem("token");
  const authHeader = token ? `Bearer ${token}` : "";
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleSaveProfile = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("bio", data.bio);
      formData.append("headline", data.headline);

      if (data.profileFile) {
        formData.append("profileImage", data.profileFile);
      }
      if (data.bannerFile) {
        formData.append("bannerImage", data.bannerFile);
      }

      await axios.put(`${API}/api/profile`, formData, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
      setIsOpen(false);
    } catch (err) {
      console.log("Update error:", err.response?.data || err.message);
    }
  };

  const uploadField = async (fieldName, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      await axios.put(`${API}/api/profile`, formData, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    uploadField("profileImage", file);
  };

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];
    uploadField("bannerImage", file);
  };

  const handleDeleteAvatar = async () => {
    try {
      await axios.delete(`${API}/api/profile/avatar`, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
    } catch (err) {
      console.error("Delete avatar failed:", err);
    }
  };

  const handleDeleteBanner = async () => {
    try {
      await axios.delete(`${API}/api/profile/banner`, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
    } catch (err) {
      console.error("Delete banner failed:", err);
    }
  };

  // 🔹 SKILLS MANAGEMENT
  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      alert("Please enter a skill name");
      return;
    }

    try {
      setLoadingSkill(true);
      await axios.post(`${API}/api/users/skills/add`, { skill: newSkill }, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
      setNewSkill("");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add skill");
    } finally {
      setLoadingSkill(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await axios.post(`${API}/api/users/skills/remove`, { skill }, {
        headers: { Authorization: authHeader },
      });
      refreshProfile();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to remove skill");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="relative h-40 bg-gray-200 bg-cover bg-center"
        style={{
          backgroundImage: user?.bannerImage ? `url(${user.bannerImage})` : "none",
        }}
      >
        {isOwner && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 border"
            >
              Edit Banner
            </button>
            {user?.bannerImage && (
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="rounded-full bg-red-500 text-white px-3 py-1 text-xs font-semibold"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-6 -mt-12 flex items-end justify-between">
        <div className="relative">
          <img
            src={user?.profileImage || "https://via.placeholder.com/100"}
            alt="profile"
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
          {isOwner && (
            <div className="absolute bottom-0 right-0">
              <button
                type="button"
                onClick={() => setShowImageMenu(!showImageMenu)}
                className="bg-white p-2 rounded-full shadow-sm border"
              >
                Edit
              </button>
              {showImageMenu && (
                <div className="absolute bottom-10 right-0 bg-white shadow-lg rounded-md p-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      avatarInputRef.current?.click();
                      setShowImageMenu(false);
                    }}
                    className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                  >
                    Upload image
                  </button>
                  {user?.profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteAvatar();
                        setShowImageMenu(false);
                      }}
                      className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-red-500"
                    >
                      Delete image
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-sm border px-4 py-1 rounded-full hover:bg-gray-100 transition"
        >
          Edit Profile
        </button>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.headline || "Add headline"}</p>

        {/* Stats Section - Clickable for Followers/Following */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <button
            onClick={() => setShowFollowersModal(true)}
            className="rounded-xl bg-gray-50 p-3 text-center hover:bg-blue-50 transition cursor-pointer"
          >
            <p className="font-semibold">{user?.followers?.length || 0}</p>
            <p className="text-gray-500">Followers</p>
          </button>
          <button
            onClick={() => setShowFollowersModal(true)}
            className="rounded-xl bg-gray-50 p-3 text-center hover:bg-blue-50 transition cursor-pointer"
          >
            <p className="font-semibold">{user?.following?.length || 0}</p>
            <p className="text-gray-500">Following</p>
          </button>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="font-semibold">{user?.profileViews || 0}</p>
            <p className="text-gray-500">Profile views</p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">About</h3>
          <p className="text-sm text-gray-700">{user?.bio || "No bio added"}</p>
        </div>

        {/* Skills Section */}
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">⭐ Skills</h3>
            {isOwner && (
              <button
                onClick={() => document.getElementById("skillsInput")?.focus()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Skill
              </button>
            )}
          </div>

          {/* Display Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-blue-200"
                >
                  <span>{skill}</span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-600 font-bold ml-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {isOwner ? "Add your skills to highlight your expertise" : "No skills yet"}
              </p>
            )}
          </div>

          {/* Add Skill Input (Owner Only) */}
          {isOwner && (
            <div className="flex gap-2">
              <input
                id="skillsInput"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddSkill();
                  }
                }}
                placeholder="e.g., React, Node.js, Python..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSkill}
                disabled={loadingSkill || !newSkill.trim()}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loadingSkill ? "Adding..." : "Add"}
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        className="hidden"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        className="hidden"
        ref={bannerInputRef}
        onChange={handleBannerChange}
      />

      <EditProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveProfile}
        user={user}
      />

      {/* Followers/Following Modal */}
      <FollowersFollowingModal
        userId={user?._id}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
      />
    </div>
  );
}

export default ProfileCard;
