import { useRef, useState } from "react";
import axios from "axios";
import { X, Image as ImageIcon } from "lucide-react";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ API URL (DEPLOY SAFE)
  const API = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    // ✅ safe preview
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      // ✅ SAFE TOKEN
      const token = localStorage.getItem("token");

      await axios.post(`${API}/api/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token || "",
        },
      });

      // RESET
      setText("");
      setImage(null);
      setPreview("");

      onClose();
      onPostCreated();

    } catch (err) {
      console.error("Post error:", err);

      alert(
        err?.response?.data?.msg ||
        err?.message ||
        "Post create failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  const canPost = text.trim() || image;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-2 sm:px-4">

      {/* MODAL */}
      <div className="w-full max-w-md sm:max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h3 className="text-lg sm:text-xl font-semibold">
            Create Post
          </h3>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* TEXT */}
        <div className="px-4 sm:px-6 py-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full min-h-[120px] sm:min-h-[150px] outline-none text-sm sm:text-lg"
          />

          {/* PREVIEW */}
          {preview && (
            <div className="mt-3 relative">
              <img
                src={preview}
                alt="preview"
                className="w-full rounded"
              />

              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs rounded"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="px-4 sm:px-6 flex gap-3">
          <button onClick={handleChooseImage}>
            <ImageIcon size={20} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* FOOTER */}
        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canPost || loading}
            className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-full text-sm"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreatePostModal;