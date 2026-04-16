import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import { searchAPI } from "../api/apiClient";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeader = token ? `Bearer ${token}` : "";
  const isOwner = !id || String(id) === String(currentUser._id);

  const fetchProfile = async () => {
    try {
      const endpoint = isOwner ? `${API}/profile` : `${API}/users/${id}`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: authHeader },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (!token) navigate("/", { replace: true });
    }
  };

  const fetchPosts = async () => {
    try {
      const endpoint = isOwner ? `${API}/posts/me` : `${API}/users/${id}/posts`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: authHeader },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error("Posts fetch error:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchPosts()]);
      
      // 👁️ TRACK PROFILE VIEW - only if viewing someone else's profile
      if (id && id !== currentUser._id) {
        try {
          await searchAPI.trackProfileView(id);
          console.log("Profile view tracked ✅");
        } catch (err) {
          console.error("Failed to track view:", err);
        }
      }
      
      setLoading(false);
    };

    load();
  }, [navigate, token, id]);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const displayedPosts = showAllPosts ? posts : posts.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[#666666]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProfileCard user={user} refreshProfile={refreshProfile} isOwner={isOwner} />

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3">{isOwner ? "Your Posts" : `${user?.name}'s Posts`}</h2>
              {posts.length === 0 ? (
                <p className="text-sm text-[#666666]">
                  {isOwner ? "No posts yet. Create one from Home to display it here." : "No posts yet."}
                </p>
              ) : (
                <>
                  {displayedPosts.map((post) => (
                    <div key={post._id} className="border rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={user.profileImage}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-[#666666]">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {post.text && <p className="text-sm mb-3">{post.text}</p>}
                      {post.images?.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {post.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`post-${index}`}
                              className="w-full rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="mt-3 text-xs text-[#666666] flex justify-between">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  ))}
                  {posts.length > 3 && !showAllPosts && (
                    <button
                      onClick={() => setShowAllPosts(true)}
                      className="w-full text-center py-2 text-[#0A66C2] font-semibold hover:underline"
                    >
                      See More
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-sm text-[#666666]">{user.bio || "No bio added."}</p>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#E7F3FF] text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#666666]">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
