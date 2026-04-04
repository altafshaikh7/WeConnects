import { useNavigate } from "react-router-dom";

function LeftSidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition"
         onClick={() => navigate("/profile")}>

      <img
        src="https://via.placeholder.com/80"
        className="rounded-full mx-auto mb-2"
      />

      <h2 className="font-semibold">{user?.name}</h2>

      <p className="text-xs text-gray-500">Web Developer</p>

      <hr className="my-3" />

      <p className="text-sm">Profile viewers 36</p>
      <p className="text-sm">Post impressions 42</p>
    </div>
  );
}

export default LeftSidebar;