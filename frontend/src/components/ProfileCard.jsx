import { useState, useRef, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import FollowersFollowingModal from "./FollowersFollowingModal";
import FollowButton from "./FollowButton";
import axios from "axios";
import { initSocket, onConnectionUpdate, onFollowRequest } from "../utils/socketClient";

function ProfileCard({ user, refreshProfile, isOwner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const authHeader = token ? `Bearer ${token}` : "";
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!isOwner && user) {
      const following = user.followers?.some((id) => String(id) === String(currentUser._id));
      setIsFollowing(Boolean(following));
    }
  }, [user, isOwner, currentUser._id]);

  useEffect(() => {
    if (!currentUser?._id) return;
    initSocket(currentUser._id);

    const unsubscribeFollow = onFollowRequest((payload) => {
      if (String(payload?.request?.to) === String(user?._id)) {
        refreshProfile?.();
      }
    });

    const unsubscribeConnection = onConnectionUpdate((payload) => {
      if (
        String(payload?.from) === String(user?._id) ||
        String(payload?.to) === String(user?._id)
      ) {
        refreshProfile?.();
      }
    });

    return () => {
      unsubscribeFollow();
      unsubscribeConnection();
    };
  }, [currentUser?._id, user?._id, refreshProfile]);

  const syncLocalUser = (updatedUser) => {
    if (!updatedUser) return;
    const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
    const newUserData = { ...currentUserData, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(newUserData));
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { user: newUserData } }));
  };

  const uploadField = async (fieldName, file) => {
    if (!file) return;

    if (fieldName === "profileImage") setUploadingImage(true);
    if (fieldName === "bannerImage") setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await axios.put(`${API}/profile`, formData, {
        headers: { Authorization: authHeader },
      });

      syncLocalUser(response.data.user || response.data);
      await refreshProfile();
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      if (fieldName === "profileImage") setUploadingImage(false);
      if (fieldName === "bannerImage") setUploadingBanner(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Are you sure you want to delete your profile picture?")) return;

    try {
      const response = await axios.delete(`${API}/profile/avatar`, {
        headers: { Authorization: authHeader },
      });
      syncLocalUser(response.data.user || response.data);
      await refreshProfile();
    } catch (err) {
      console.error("Delete avatar failed:", err);
      alert("Failed to delete profile picture");
    }
  };

  const handleDeleteBanner = async () => {
    if (!confirm("Are you sure you want to delete your banner?")) return;

    try {
      const response = await axios.delete(`${API}/profile/banner`, {
        headers: { Authorization: authHeader },
      });
      syncLocalUser(response.data.user || response.data);
      await refreshProfile();
    } catch (err) {
      console.error("Delete banner failed:", err);
      alert("Failed to delete banner");
    }
  };

  const handleSaveProfile = async (data) => {
    try {
      const response = await axios.put(`${API}/profile`, data, {
        headers: { Authorization: authHeader },
      });
      syncLocalUser(response.data.user || response.data);
      await refreshProfile();
      setIsOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      setLoadingSkill(true);
      await axios.post(
        `${API}/users/skills/add`,
        { skill: newSkill },
        { headers: { Authorization: authHeader } }
      );
      await refreshProfile();
      setNewSkill("");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add skill");
    } finally {
      setLoadingSkill(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await axios.post(
        `${API}/users/skills/remove`,
        { skill },
        { headers: { Authorization: authHeader } }
      );
      await refreshProfile();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to remove skill");
    }
  };

  const getAvatarUrl = () =>
    user?.profileImage && user.profileImage !== "https://via.placeholder.com/100"
      ? user.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0A66C2&color=fff&bold=true&size=100`;

  const getBannerStyle = () =>
    user?.bannerImage
      ? { backgroundImage: `url(${user.bannerImage})` }
      : { backgroundImage: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)" };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40 bg-cover bg-center" style={getBannerStyle()}>
        {isOwner && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-gray-700 border hover:bg-white transition disabled:opacity-50"
            >
              {uploadingBanner ? "Uploading..." : "Edit Banner"}
            </button>
            {user?.bannerImage && (
              <button
                type="button"
                onClick={handleDeleteBanner}
                className="rounded-full bg-red-500 text-white px-3 py-1 text-xs font-semibold hover:bg-red-600 transition"
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
            src={getAvatarUrl()}
            alt="profile"
            className="w-24 h-24 rounded-full border-4 border-white object-cover bg-gray-100"
          />
          {isOwner && (
            <div className="absolute bottom-0 right-0">
              <button
                type="button"
                onClick={() => setShowImageMenu(!showImageMenu)}
                className="bg-white p-2 rounded-full shadow-sm border hover:bg-gray-50 transition"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
              {showImageMenu && (
                <div className="absolute bottom-10 right-0 bg-white shadow-lg rounded-md p-2 z-10 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => {
                      avatarInputRef.current?.click();
                      setShowImageMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    Upload photo
                  </button>
                  {user?.profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteAvatar();
                        setShowImageMenu(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-500"
                    >
                      Delete photo
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isOwner ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-sm border px-4 py-1.5 rounded-full hover:bg-gray-100 transition font-medium text-[#0A66C2]"
          >
            Edit Profile
          </button>
        ) : (
          <FollowButton
            user={user}
            isFollowing={isFollowing}
            onFollowChange={(following) => {
              setIsFollowing(following);
              refreshProfile();
            }}
          />
        )}
      </div>

      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-sm text-gray-500">{user?.headline || "Add headline"}</p>

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

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">About</h3>
          <p className="text-sm text-gray-700">{user?.bio || "No bio added"}</p>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Skills</h3>
            {isOwner && (
              <button
                onClick={() => document.getElementById("skillsInput")?.focus()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Skill
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {user?.skills?.length > 0 ? (
              user.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-blue-200"
                >
                  <span>{skill}</span>
                  {isOwner && (
                    <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600 font-bold ml-1">
                      x
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

          {isOwner && (
            <div className="flex gap-2">
              <input
                id="skillsInput"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
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
        onChange={(event) => uploadField("profileImage", event.target.files?.[0])}
        accept="image/*"
      />
      <input
        type="file"
        className="hidden"
        ref={bannerInputRef}
        onChange={(event) => uploadField("bannerImage", event.target.files?.[0])}
        accept="image/*"
      />

      <EditProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveProfile}
        user={user}
      />

      <FollowersFollowingModal
        userId={user?._id}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
      />
    </div>
  );
}

export default ProfileCard;
