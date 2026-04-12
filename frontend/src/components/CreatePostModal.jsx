import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { X, Image as ImageIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import imageCompression from "browser-image-compression";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fileInputRef = useRef(null);

  // ✅ FINAL API FIX
  const API = "http://127.0.0.1:5000";

  // ✅ Load user
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) setCurrentUser(user);
    } catch {}
  }, []);

  // ✅ Cleanup previews
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  if (!isOpen) return null;

  // 📸 Handle images
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

  const handleEmojiClick = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🚀 FINAL SUBMIT
  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return;

    try {
      console.log("POST CLICKED");
      console.log("Images:", images);

      setLoading(true);

      const formData = new FormData();
      formData.append("text", text);

      images.forEach((img, index) => {
        const filename = img.name || `image-${Date.now()}-${index}.jpg`;
        formData.append("images", img, filename);
      });

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API}/api/posts`, formData, {
        headers: {
          Authorization: token || "",
        },
        withCredentials: true,
      });

      console.log("SUCCESS:", res.data);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-2">

      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Create Post</h3>
          <X onClick={onClose} className="cursor-pointer" />
        </div>

        {/* BODY */}
        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

          {/* USER */}
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser?.profilePic ||
                `https://ui-avatars.com/api/?name=${currentUser?.name || "User"}`
              }
              className="w-12 h-12 rounded-full object-cover border"
            />

            <div>
              <p className="font-semibold">{currentUser?.name || "User"}</p>
              <p className="text-xs text-gray-500">Post to Anyone 🌍</p>
            </div>
          </div>

          {/* TEXT */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full min-h-[120px] outline-none text-lg"
          />

          {/* IMAGES */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative bg-black rounded-xl overflow-hidden">
                  <img src={src} className="w-full h-48 object-contain" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black/70 text-white px-2 text-xs rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 border-t">

          <div className="flex items-center gap-5">
            <button onClick={() => fileInputRef.current.click()}>
              <ImageIcon size={20} />
            </button>

            <button onClick={() => setShowEmoji(!showEmoji)}>😀</button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canPost || loading}
            className={`px-5 py-2 rounded-full text-sm font-medium
              ${canPost ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}
            `}
          >
            {loading ? "Posting..." : "Post"}
          </button>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* EMOJI */}
        {showEmoji && (
          <div className="px-5 pb-4">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePostModal;