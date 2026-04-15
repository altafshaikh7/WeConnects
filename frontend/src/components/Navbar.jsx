import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Search, MessageSquare, Bell, LogOut } from "lucide-react";
import Logo from "./logo";

function Navbar() {
  // ✅ SAFE USER (NO CRASH)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Network", icon: Users, path: "/network" },
  ];

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2">

        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo />

          {/* SEARCH */}
          <div className="hidden sm:flex items-center bg-[#eef3f8] px-2 sm:px-3 py-1.5 sm:py-2 rounded-md w-36 sm:w-56 md:w-72">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center cursor-pointer transition ${
                    isActive(item.path)
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              );
            })}

            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <MessageSquare size={18} />
              <span>Messaging</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:text-black relative">
              <Bell size={18} />
              <span>Notifications</span>
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
                3
              </span>
            </div>
          </div>

          {/* PROFILE */}
          <div
            className="relative group hidden md:flex flex-col items-center cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <img
              src={user?.profileImage || "https://via.placeholder.com/40"}
              alt="user"
              className="w-8 h-8 rounded-full object-cover"
            />

            <span className="text-xs">Me</span>

            {/* DROPDOWN */}
            <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md p-3 hidden group-hover:block">
              <p className="text-sm font-semibold mb-2">
                {user?.name || "User"}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="text-red-500 text-sm hover:underline"
              >
                Logout
              </button>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-4 pb-4 border-t bg-white text-sm">
          <div className="flex flex-col gap-3 mt-3">

            <span className="cursor-pointer">🏠 Home</span>
            <span className="cursor-pointer">👥 Network</span>
            <span className="cursor-pointer">💼 Jobs</span>
            <span className="cursor-pointer">💬 Messaging</span>
            <span className="cursor-pointer">🔔 Notifications</span>

            <hr />

            <p className="font-semibold">
              {user?.name || "User"}
            </p>

            <button
              onClick={logout}
              className="text-red-500 text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;