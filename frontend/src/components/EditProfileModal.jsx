import { useState, useEffect } from "react";

function EditProfileModal({ isOpen, onClose, onSave, user }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");

  // 🔥 sync data
  useEffect(() => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setHeadline(user?.headline || "");
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      name,
      bio,
      headline,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          Edit Profile
        </h2>

        {/* 🔥 NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔥 HEADLINE */}
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Headline"
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔥 BIO */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          className="w-full border p-2 rounded h-24 mb-3"
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#0A66C2] text-white px-4 py-1 rounded hover:bg-[#004182]"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfileModal;