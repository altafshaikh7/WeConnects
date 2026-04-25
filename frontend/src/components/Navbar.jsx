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
import Logo from "./logo";
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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
        <button className="md:hidden" onClick={() => setOpen((prev) => !prev)} type="button">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button type="button" onClick={() => navigate("/home")} className="shrink-0">
          <Logo />
        </button>

        <div ref={searchRef} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />

          {showResults && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
              {loading ? (
                <p className="px-3 py-2 text-sm text-gray-500">Searching...</p>
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-white"
                  >
                    {!result.notFound && !result.error && (
                      <img
                        src={
                          result.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || "User")}&background=0A66C2&color=fff`
                        }
                        alt={result.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.name}</p>
                      {!result.notFound && !result.error && (
                        <p className="text-xs text-gray-500">{result.headline || "Professional"}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div ref={profileDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1.5 hover:bg-gray-50"
            >
              <img src={getProfileImage()} alt="profile" className="h-8 w-8 rounded-full object-cover" />
              <span className="hidden max-w-24 truncate text-sm font-medium text-gray-700 lg:block">
                {user?.name || "Profile"}
              </span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <User size={16} />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-3 py-3 md:hidden">
          <div className="mb-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
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
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
