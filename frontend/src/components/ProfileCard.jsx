import { useState } from "react";

function ProfileCard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [bio, setBio] = useState(
    localStorage.getItem("bio") || ""
  );

  const [image, setImage] = useState(
    localStorage.getItem("profileImage") || null
  );

  // 📌 Save Bio
  const saveBio = () => {
    localStorage.setItem("bio", bio);
    alert("Bio saved ✅");
  };

  // 📌 Image Upload
  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem("profileImage", reader.result);
      setImage(reader.result);
    };

    if (file) reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">

      {/* COVER */}
      <div className="h-40 bg-gray-200 rounded-t-lg"></div>

      {/* PROFILE IMAGE */}
      <div className="px-6 -mt-12">
        <img
          src={image || "https://via.placeholder.com/100"}
          className="w-24 h-24 rounded-full border-4 border-white object-cover"
        />

        {/* Upload button */}
        <input
          type="file"
          onChange={handleImage}
          className="mt-2 text-sm"
        />
      </div>

      {/* USER INFO */}
      <div className="px-6 py-4">

        <h2 className="text-xl font-semibold">
          {user?.name}
        </h2>

        <p className="text-sm text-gray-500">
          Web Developer 🚀
        </p>

        {/* BIO SECTION */}
        <div className="mt-4">

          <textarea
            placeholder="Write your bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border p-2 rounded-md text-sm"
          />

          <button
            onClick={saveBio}
            className="mt-2 bg-[#0a66c2] text-white px-4 py-1 rounded"
          >
            Save Bio
          </button>

          {/* SHOW BIO */}
          {bio && (
            <p className="mt-3 text-sm text-gray-700">
              {bio}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}

export default ProfileCard;