import { useRef, useState } from "react";
import axios from "axios";
import { X, Image as ImageIcon, Smile, Plus, Clock3 } from "lucide-react";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
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

      await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: localStorage.getItem("token"), // 🔥 IMPORTANT
          },
        }
      );

      setText("");
      setImage(null);
      setPreview("");
      onClose();
      onPostCreated();

    } catch (err) {
      alert(err.response?.data?.msg || "Post create failed");
    } finally {
      setLoading(false);
    }
  };

  const canPost = text.trim() || image;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/150"
              className="w-14 h-14 rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold">Create Post</h3>
              <p className="text-sm text-gray-500">Post to Anyone</p>
            </div>
          </div>

          <button onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        {/* TEXT */}
        <div className="px-6 py-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full min-h-[150px] outline-none text-lg"
          />

          {/* PREVIEW */}
          {preview && (
            <div className="mt-4 relative">
              <img src={preview} className="w-full rounded" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="px-5 flex gap-4">
          <button onClick={handleChooseImage}>
            <ImageIcon />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* FOOTER */}
        <div className="border-t px-5 py-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canPost || loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;