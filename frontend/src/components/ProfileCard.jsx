import { useState, useRef } from "react";
import EditProfileModal from "./EditProfileModal";
import axios from "axios";

function ProfileCard({ user, refreshProfile, isOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
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

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="font-semibold">{user?.followers?.length || 0}</p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="font-semibold">{user?.following?.length || 0}</p>
            <p className="text-gray-500">Following</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="font-semibold">{user?.profileViews || 0}</p>
            <p className="text-gray-500">Profile views</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">About</h3>
          <p className="text-sm text-gray-700">{user?.bio || "No bio added"}</p>
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
    </div>
  );
}

export default ProfileCard;
