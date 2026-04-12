import { useNavigate } from "react-router-dom";

function LeftSidebar() {
  // ✅ SAFE USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/profile")}
      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition"
    >

      {/* PROFILE IMAGE */}
      <img
        src={
          user?.profileImage ||
          "https://via.placeholder.com/80"
        }
        alt="profile"
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover"
      />

      {/* NAME */}
      <h2 className="font-semibold text-sm sm:text-base">
        {user?.name || "User"}
      </h2>

      {/* ROLE */}
      <p className="text-[10px] sm:text-xs text-gray-500">
        Web Developer 🚀
      </p>

      <hr className="my-3" />

      {/* STATS */}
      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
        <p>Profile viewers 36</p>
        <p>Post impressions 42</p>
      </div>

    </div>
  );
}

export default LeftSidebar;