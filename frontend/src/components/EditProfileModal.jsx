import { useState } from "react";

function EditProfileModal({ isOpen, onClose, onSave, currentBio }) {
  const [bio, setBio] = useState(currentBio);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

      <div className="bg-white p-6 rounded-lg w-[350px]">

        <h2 className="text-lg font-semibold mb-3">Edit Profile</h2>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={() => {
              onSave(bio);
              onClose();
            }}
            className="bg-[#0a66c2] text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfileModal;