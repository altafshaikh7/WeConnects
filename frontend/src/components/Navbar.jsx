import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  Search,
  Bell,
  LogOut,
  MessageCircle,
  User,
  Settings,
} from "lucide-react";
import axios from "axios";
import { initSocket, onReceiveNotification } from "../utils/socketClient";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  const navItems = [
    { label: "Home", icon: Home, path: "/home" },
    { label: "Network", icon: Users, path: "/network" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
  ];

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      const res = await axios.get(`${API}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [API, token, user?._id]);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.user) {
        setUser(event.detail.user);
        localStorage.setItem("user", JSON.stringify(event.detail.user));
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === "user" && event.newValue) {
        try {
          setUser(JSON.parse(event.newValue));
        } catch (err) {
          console.error("Error parsing user from storage:", err);
        }
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    fetchUnreadCount();
    initSocket(user._id);

    const unsubscribe = onReceiveNotification(() => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUnreadCount, user?._id]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API}/search/users?query=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
  }, [searchQuery, API, token]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getProfileImage = () =>
    user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0A66C2&color=fff`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
        
        {/* LEFT - Menu + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="md:hidden p-1" onClick={() => setOpen((prev) => !prev)} type="button">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button type="button" onClick={() => navigate("/home")} className="shrink-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#0A66C2] cursor-pointer whitespace-nowrap">
              WeConnects
            </div>
          </button>
        </div>

        {/* CENTER - Search Bar with proper positioning */}
        <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={searchRef}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Search Results Dropdown - Positioned relative to search bar */}
          {showResults && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-gray-200 bg-white shadow-lg z-[100] max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No users found</p>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <button
                    key={result._id || index}
                    type="button"
                    disabled={result.notFound || result.error}
                    onClick={() => {
                      if (result._id) {
                        navigate(`/profile/${result._id}`);
                        setShowResults(false);
                        setSearchQuery("");
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {!result.notFound && !result.error && (
                      <>
                        <img
                          src={
                            result.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || "User")}&background=0A66C2&color=fff&size=40`
                          }
                          alt={result.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {result.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.headline || "Professional"}
                          </p>
                        </div>
                      </>
                    )}
                    {(result.notFound || result.error) && (
                      <p className="text-sm text-gray-500 w-full text-center">{result.name}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* RIGHT - Nav Items */}
        <nav className="flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div ref={profileDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 hover:bg-gray-50 transition-all"
            >
              <img src={getProfileImage()} alt="profile" className="h-7 w-7 rounded-full object-cover" />
              <span className="hidden max-w-20 truncate text-sm font-medium text-gray-700 xl:block">
                {user?.name?.split(" ")[0] || "Profile"}
              </span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <img 
                      src={getProfileImage()} 
                      alt="profile" 
                      className="h-10 w-10 rounded-full object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.headline || "View your profile"}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <User size={16} />
                  View Profile
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    navigate("/settings");
                    setShowProfileDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings size={16} />
                  Settings & Privacy
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-3 py-3 md:hidden animate-slideDown">
          <div className="mb-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                navigate("/notifications");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell size={18} />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={18} />
              Profile
            </button>

            <button
              type="button"
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings size={18} />
              Settings
            </button>

            <div className="border-t my-2"></div>

            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        
      `}</style>
    </header>
  );
}

export default Navbar;