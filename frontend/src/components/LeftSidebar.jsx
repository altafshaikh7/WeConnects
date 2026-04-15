import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LeftSidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    fetchUser();
  }, [API, token]);

  if (!user) {
    return (
      <div className="bg-white p-4 rounded shadow text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate("/profile")}
      className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition"
    >
      <img
        src={
          user.profileImage ||
          "https://via.placeholder.com/80"
        }
        alt="profile"
        className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
      />

      <h2 className="font-semibold text-base">{user.name}</h2>

      <p className="text-xs text-gray-500">
        {user.headline || "Add headline"}
      </p>

      <hr className="my-3" />

      <div className="text-sm text-gray-600 space-y-1">
        <p>Profile viewers 36</p>
        <p>Post impressions 42</p>
      </div>
    </div>
  );
}

export default LeftSidebar;