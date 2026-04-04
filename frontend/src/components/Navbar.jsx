import Logo from "./logo";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">

        {/* LEFT */}
        <div className="flex items-center gap-3 w-full md:w-auto">

          <Logo />

          {/* 🔥 Better Search */}
          <div className="hidden sm:flex items-center bg-[#eef3f8] px-3 py-2 rounded-md w-72">
            <span className="text-gray-500 text-sm mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6 text-xs md:text-sm text-gray-600">

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-6">

            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <span>🏠</span>
              <span>Home</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <span>👥</span>
              <span>Network</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <span>💼</span>
              <span>Jobs</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <span>💬</span>
              <span>Messaging</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black relative">
              <span>🔔</span>
              <span>Notifications</span>

              {/* 🔴 Notification badge */}
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
                3
              </span>
            </div>

          </div>

          {/* PROFILE */}
          <div className="flex flex-col items-center cursor-pointer group">

            <div className="w-8 h-8 bg-[#0a66c2] text-white rounded-full flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)}
            </div>

            <span className="hidden md:block text-xs">Me</span>

            {/* 🔥 Dropdown */}
            <div className="absolute top-14 right-4 bg-white shadow-lg rounded-md p-3 hidden group-hover:block">
              <p className="text-sm font-semibold mb-2">{user?.name}</p>

              <button
                onClick={logout}
                className="text-red-500 text-sm hover:underline"
              >
                Logout
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Navbar;