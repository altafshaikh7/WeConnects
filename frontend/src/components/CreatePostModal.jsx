import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { X, Image, Smile, Send, Globe, Users, Lock, Trash2, Plus } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import imageCompression from "browser-image-compression";
import VisibilityModal from "./VisibilityModal";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showVisibility, setShowVisibility] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [charCount, setCharCount] = useState(0);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) setCurrentUser(user);
    } catch {}
  }, []);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    const newImages = [];
    const newPreviews = [];

    for (let file of files) {
      if (!file.type.startsWith("image/")) continue;

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        newImages.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch (err) {
        console.error("Compression error:", err);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji.emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", text);
      formData.append("visibility", visibility);

      images.forEach((img, index) => {
        const filename = img.name || `image-${Date.now()}-${index}.jpg`;
        formData.append("images", img, filename);
      });

      const token = localStorage.getItem("token");
      const authHeader = token ? `Bearer ${token}` : "";

      const res = await axios.post(`${API}/posts`, formData, {
        headers: { Authorization: authHeader },
      });

      setText("");
      setImages([]);
      setPreviews([]);
      onClose();
      onPostCreated();
    } catch (err) {
      console.error("POST ERROR:", err);
      alert("Post failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const canPost = text.trim() || images.length > 0;
  const isOverLimit = charCount > 3000;

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public": return <Globe size={14} />;
      case "connections": return <Users size={14} />;
      case "only-me": return <Lock size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const getVisibilityText = () => {
    switch (visibility) {
      case "public": return "Anyone";
      case "connections": return "Connections only";
      case "only-me": return "Only me";
      default: return "Anyone";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Create post
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    currentUser?.profileImage ||
                    `https://ui-avatars.com/api/?name=${currentUser?.name || "User"}&background=0D8CFF&color=fff`
                  }
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  alt="Profile"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentUser?.name || "User"}</p>
                <button
                  onClick={() => setShowVisibility(true)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {getVisibilityIcon()}
                  <span>{getVisibilityText()}</span>
                  <span className="text-gray-400">▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full min-h-[180px] outline-none text-gray-700 placeholder-gray-400 text-lg resize-none"
              maxLength="3000"
            />
            {charCount > 0 && (
              <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/3000
              </div>
            )}
          </div>

          {/* Image Preview Grid */}
          {previews.length > 0 && (
            <div className="mt-4">
              <div className={`grid gap-3 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={src} 
                      alt={`Preview ${i + 1}`}
                      className="w-full h-56 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Image Button (if no images) */}
          {previews.length === 0 && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                  <Plus size={24} className="text-gray-500 group-hover:text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 group-hover:text-blue-600">Add photos</p>
              </div>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* Media Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors group"
                title="Add image"
              >
                <Image size={22} className="text-green-600 group-hover:scale-110 transition" />
              </button>
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors group"
                title="Add emoji"
              >
                <Smile size={22} className="text-yellow-600 group-hover:scale-110 transition" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canPost || loading || isOverLimit}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2
                ${canPost && !isOverLimit
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>

          {/* Character Limit Warning */}
          {isOverLimit && (
            <div className="text-red-500 text-xs text-center mt-2">
              Character limit exceeded! Maximum 3000 characters.
            </div>
          )}

          {/* Emoji Picker */}
          {showEmoji && (
            <div className="mt-3 animate-slideUp">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                width="100%"
                height="350px"
                theme="light"
              />
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Visibility Modal */}
        <VisibilityModal
          isOpen={showVisibility}
          onClose={() => setShowVisibility(false)}
          onSelect={setVisibility}
          currentVisibility={visibility}
        />
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
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

export default CreatePostModal;