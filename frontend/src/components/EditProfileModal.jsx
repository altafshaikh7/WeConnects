import { useState, useEffect, useRef } from "react";
import { X, Camera, User, Briefcase, FileText, Loader } from "lucide-react";

function EditProfileModal({ isOpen, onClose, onSave, user }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  // 🔥 sync data
  useEffect(() => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setHeadline(user?.headline || "");
    setProfileImagePreview(user?.profileImage || "");
  }, [user]);

  if (!isOpen) return null;

  // Handle image upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!profileImage) return null;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    
    try {
      const response = await fetch(`${API}/upload/profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      }
      throw new Error("Upload failed");
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    // Upload image first if selected
    let uploadedImageUrl = null;
    if (profileImage) {
      uploadedImageUrl = await uploadImage();
      if (!uploadedImageUrl && profileImage) {
        setSaving(false);
        return;
      }
    }
    
    // Call onSave with all data
    await onSave({
      name,
      bio,
      headline,
      profileImage: uploadedImageUrl || profileImagePreview,
    });
    
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 ring-4 ring-white shadow-lg">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <User size={40} className="text-white" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-[#0A66C2] hover:underline"
            >
              Change photo
            </button>
            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Loader size={14} className="animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={14} className="inline mr-1" />
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none transition-all"
            />
          </div>

          {/* Headline Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Briefcase size={14} className="inline mr-1" />
              Headline
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Software Engineer at Google"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none transition-all"
            />
          </div>

          {/* Bio Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText size={14} className="inline mr-1" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={4}
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default EditProfileModal;