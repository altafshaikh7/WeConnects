import Navbar from "../components/Navbar";
import { useState } from "react";
import axios from "axios";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [bio, setBio] = useState(
    localStorage.getItem("bio") || ""
  );

  const [image, setImage] = useState(
    localStorage.getItem("profileImage") || null
  );

  const [cover, setCover] = useState(
    localStorage.getItem("coverImage") || null
  );

  const [skills, setSkills] = useState(
    JSON.parse(localStorage.getItem("skills")) || []
  );

  const [input, setInput] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  // 🔥 Save Bio (modal se)
  const saveBio = async () => {
    setBio(tempBio);
    localStorage.setItem("bio", tempBio);

    try {
      await axios.post("http://localhost:5000/api/profile", {
        bio: tempBio,
        userId: user?._id,
      });
    } catch (err) {
      console.log(err);
    }

    setIsOpen(false);
  };

  // 🔥 Upload Profile Image
  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem("profileImage", reader.result);
      setImage(reader.result);
    };

    if (file) reader.readAsDataURL(file);
  };

  // 🔥 Upload Cover Image
  const handleCover = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem("coverImage", reader.result);
      setCover(reader.result);
    };

    if (file) reader.readAsDataURL(file);
  };

  // 🔥 Add Skill
  const addSkill = () => {
    if (!input) return;

    const updated = [...skills, input];
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
    setInput("");
  };

  return (
    <div className="bg-[#f3f2ef] min-h-screen">

      <Navbar />

      <div className="max-w-5xl mx-auto mt-6 px-4">

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">

          {/* 🔥 COVER */}
          <div className="relative h-40 bg-gray-300">
            <img
              src={cover || "https://via.placeholder.com/800x200"}
              className="w-full h-full object-cover"
            />

            <label className="absolute top-2 right-2 bg-white px-3 py-1 text-sm rounded shadow cursor-pointer">
              Edit Cover
              <input type="file" onChange={handleCover} className="hidden" />
            </label>
          </div>

          {/* 🔥 PROFILE IMAGE */}
          <div className="relative">
            <div className="absolute -top-14 left-6">
              <img
                src={image || "https://via.placeholder.com/100"}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
              />

              <label className="absolute bottom-1 right-1 bg-white p-1 rounded-full cursor-pointer text-xs">
                ✏️
                <input type="file" onChange={handleImage} className="hidden" />
              </label>
            </div>
          </div>

          {/* 🔥 USER INFO */}
          <div className="px-6 pt-20 pb-4">

            <h1 className="text-2xl font-semibold">{user?.name}</h1>

            <p className="text-gray-500 text-sm">
              Full Stack Developer 🚀
            </p>

            {/* EDIT BUTTON */}
            <button
              onClick={() => setIsOpen(true)}
              className="mt-3 border px-3 py-1 rounded"
            >
              Edit Profile
            </button>

            {/* BIO */}
            <p className="mt-3 text-sm">{bio}</p>

            <hr className="my-4" />

            {/* 🔥 SKILLS */}
            <div>
              <h2 className="font-semibold mb-2">Skills</h2>

              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Add skill"
                  className="border p-2 rounded w-full"
                />

                <button
                  onClick={addSkill}
                  className="bg-[#0a66c2] text-white px-3 rounded"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🔥 MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white p-6 rounded-lg w-[350px]">

            <h2 className="text-lg font-semibold mb-3">
              Edit Profile
            </h2>

            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsOpen(false)}>
                Cancel
              </button>

              <button
                onClick={saveBio}
                className="bg-[#0a66c2] text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;