import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  User, Lock, Bell, Shield, Moon, Save, RefreshCw, 
  CheckCircle, AlertCircle, ChevronRight, Globe, Eye, Mail, Phone,
  ArrowLeft
} from "lucide-react";
import Navbar from "../components/Navbar";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    profile: {},
    notifications: { email: true, push: true, sms: false },
    privacy: { profileVisibility: "public", showEmail: false, showPhone: false },
    appearance: { theme: "light", fontSize: "medium" }
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data.settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(`${API}/settings/profile`, settings.profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(`${API}/settings/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings/notifications`, settings.notifications, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Notification settings updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update notifications");
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacy = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings/privacy`, settings.privacy, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Privacy settings updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update privacy");
    } finally {
      setSaving(false);
    }
  };

  const updateAppearance = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings/appearance`, settings.appearance, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Appearance settings updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update appearance");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: <User size={18} /> },
    { id: "security", name: "Security", icon: <Lock size={18} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={18} /> },
    { id: "privacy", name: "Privacy", icon: <Shield size={18} /> },
    { id: "appearance", name: "Appearance", icon: <Moon size={18} /> }
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header with Back Button */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
                <span className="text-sm">Back</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span className="flex-1 text-left">{tab.name}</span>
                    <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Profile Settings */}
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileUpdate} className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={settings.profile.name || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={settings.profile.email || ""}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={settings.profile.phone || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                        <input
                          type="text"
                          value={settings.profile.headline || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, headline: e.target.value }
                          })}
                          placeholder="e.g., Software Engineer at Google"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          rows="3"
                          value={settings.profile.bio || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, bio: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={settings.profile.location || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, location: e.target.value }
                          })}
                          placeholder="City, Country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={settings.profile.company || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: { ...settings.profile, company: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={settings.profile.position || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: { ...settings.profile, position: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={settings.profile.website || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, website: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                          <input
                            type="text"
                            value={settings.profile.github || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: { ...settings.profile, github: e.target.value }
                            })}
                            placeholder="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                          <input
                            type="text"
                            value={settings.profile.linkedin || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: { ...settings.profile, linkedin: e.target.value }
                            })}
                            placeholder="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                          <input
                            type="text"
                            value={settings.profile.twitter || ""}
                            onChange={(e) => setSettings({
                              ...settings,
                              profile: { ...settings.profile, twitter: e.target.value }
                            })}
                            placeholder="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Settings */}
                {activeTab === "security" && (
                  <form onSubmit={handlePasswordUpdate} className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Notification Settings */}
                {activeTab === "notifications" && (
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, email: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-xs text-gray-500">Get real-time alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, push: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Get text message alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.sms}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, sms: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={updateNotifications}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === "privacy" && (
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="public">Public - Anyone can view</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Private - Only me</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">Show Email on Profile</p>
                          <p className="text-xs text-gray-500">Allow others to see your email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showEmail}
                            onChange={(e) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showEmail: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">Show Phone on Profile</p>
                          <p className="text-xs text-gray-500">Allow others to see your phone number</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showPhone}
                            onChange={(e) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, showPhone: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={updatePrivacy}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Privacy Settings"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeTab === "appearance" && (
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, theme: "light" }
                            })}
                            className={`p-3 border rounded-lg text-center transition ${
                              settings.appearance.theme === "light"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            🌞 Light
                          </button>
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, theme: "dark" }
                            })}
                            className={`p-3 border rounded-lg text-center transition ${
                              settings.appearance.theme === "dark"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            🌙 Dark
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <div className="grid grid-cols-3 gap-3">
                          {["small", "medium", "large"].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSettings({
                                ...settings,
                                appearance: { ...settings.appearance, fontSize: size }
                              })}
                              className={`p-2 border rounded-lg text-center capitalize transition ${
                                settings.appearance.fontSize === size
                                  ? "border-blue-500 bg-blue-50 text-blue-600"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={updateAppearance}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Appearance"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;