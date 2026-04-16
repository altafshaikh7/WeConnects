import axios from "axios";

function UnfollowModal({ user, onUnfollow, onCancel }) {
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");

  const handleUnfollow = async () => {
    try {
      await axios.post(`${API}/users/${user._id}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Call parent callback
      if (onUnfollow) {
        onUnfollow(user._id);
      }
    } catch (err) {
      console.error("Unfollow failed:", err);
      alert("Failed to unfollow");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Unfollow {user?.name}?</h2>
        <p className="text-gray-600 text-sm mb-6">
          You will no longer see posts from {user?.name} in your feed.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUnfollow}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnfollowModal;
