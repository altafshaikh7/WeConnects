import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Search, Bell, LogOut } from "lucide-react";
import Logo from "./logo";
import axios from "axios";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const navItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Network", icon: Users, path: "/network" },
  ];

  const isActive = (path) => location.pathname === path;

  // 🔍 SEARCH USERS LIVE
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/search/users?query=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.length === 0) {
          setSearchResults([{ name: "No profile found", notFound: true }]);
        } else {
          setSearchResults(response.data);
        }
        setShowResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([{ name: "Search error", error: true }]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResult = (user) => {
    if (user._id) {
      navigate(`/profile/${user._id}`);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-4">

        {/* LEFT - LOGO */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* CENTER - SEARCH BAR (Only on desktop) */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <div className="flex items-center bg-[#eef3f8] px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-400 transition">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                className="bg-transparent outline-none text-sm w-full ml-2"
              />
              {loading && (
                <span className="text-xs text-gray-400 animate-spin">⟳</span>
              )}
            </div>

            {/* SEARCH SUGGESTIONS DROPDOWN */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <div
                    key={result._id || "no-result"}
                    onClick={() => handleSearchResult(result)}
                    className={`px-4 py-3 border-b last:border-b-0 transition ${
                      result.notFound || result.error
                        ? "text-gray-500 text-center py-4 cursor-default hover:bg-gray-50"
                        : "flex items-center gap-3 cursor-pointer hover:bg-blue-50"
                    }`}
                  >
                    {!result.notFound && !result.error && (
                      <>
                        <img
                          src={result.profileImage || "https://via.placeholder.com/40"}
                          alt={result.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs text-gray-600">{result.headline}</p>
                        </div>
                      </>
                    )}
                    {(result.notFound || result.error) && result.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - NAV ITEMS */}
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center cursor-pointer transition ${
                    isActive(item.path)
                      ? "text-black"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[10px] mt-1">{item.label}</span>
                </div>
              );
            })}

            <div 
              onClick={() => navigate("/notifications")}
              className="flex flex-col items-center cursor-pointer hover:text-black transition relative"
            >
              <Bell size={18} />
              <span className="text-[10px] mt-1">Notifications</span>
            </div>
          </div>

          {/* PROFILE */}
          <div
            className="relative group hidden md:flex flex-col items-center cursor-pointer"
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <img
              src={user?.profileImage || "https://via.placeholder.com/40"}
              alt="user"
              className="w-8 h-8 rounded-full object-cover hover:ring-2 ring-blue-500 transition"
            />
            <span className="text-xs mt-1">Me</span>

            {/* DROPDOWN MENU */}
            <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md p-3 hidden group-hover:block whitespace-nowrap">
              <p className="text-sm font-semibold mb-2">
                {user?.name || "User"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="text-red-500 text-sm hover:underline flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-4 pb-4 border-t bg-white">
          {/* MOBILE SEARCH */}
          <div className="mt-3 mb-4">
            <div className="flex items-center bg-[#eef3f8] px-3 py-2 rounded-lg">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-full ml-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <span
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className="cursor-pointer hover:text-blue-600"
              >
                {item.label}
              </span>
            ))}
            <span 
              onClick={() => {
                navigate("/notifications");
                setOpen(false);
              }}
              className="cursor-pointer hover:text-blue-600"
            >
              Notifications
            </span>

            <hr />

            <p className="font-semibold">
              {user?.name || "User"}
            </p>

            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="text-red-500 text-left hover:underline flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;