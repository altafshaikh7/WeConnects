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
  const [postsToShow, setPostsToShow] = useState(9);
  const navigate = useNavigate();
  const { id } = useParams();

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeader = token ? `Bearer ${token}` : "";
  const isOwner = !id || String(id) === String(currentUser._id);

  const fetchProfile = async (profileId = id) => {
    try {
      const endpoint = isOwner ? `${API}/profile` : `${API}/users/${profileId}`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: authHeader },
      });
      const profileData = res.data?.user || res.data;
      setUser(profileData);

      if (isOwner && profileData) {
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent("profileUpdated", {
          detail: { user: updatedUser },
        }));
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (!token) navigate("/", { replace: true });
    }
  };

  const fetchPosts = async (profileId = id) => {
    try {
      const endpoint = isOwner ? `${API}/posts/me` : `${API}/users/${profileId}/posts`;
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
      const profileId = id || currentUser?._id;
      await Promise.all([fetchProfile(profileId), fetchPosts(profileId)]);

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
  }, [navigate, token, id, currentUser?._id]);

  const refreshProfile = async () => {
    const profileId = id || currentUser?._id;
    await Promise.all([fetchProfile(profileId), fetchPosts(profileId)]);
  };

  const displayedPosts = posts.slice(0, postsToShow);
  const hasMorePosts = posts.length > postsToShow;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0A66C2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ProfileCard 
          user={user} 
          refreshProfile={refreshProfile} 
          isOwner={isOwner}
          onProfileUpdate={(updatedUser) => {
            // Update local user state
            setUser(updatedUser);
            // Update localStorage
            const newUserData = { ...currentUser, ...updatedUser };
            localStorage.setItem("user", JSON.stringify(newUserData));
            // Dispatch event for navbar
            window.dispatchEvent(new CustomEvent("profileUpdated", { 
              detail: { user: newUserData } 
            }));
          }}
        />

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-4">{isOwner ? "Your Posts" : `${user?.name}'s Posts`}</h2>
              {posts.length === 0 ? (
                <p className="text-sm text-[#666666]">
                  {isOwner ? "No posts yet. Create one from Home to display it here." : "No posts yet."}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {displayedPosts.map((post) => {
                      const allImages = [
                        ...(post?.image ? [post.image] : []),
                        ...(post?.images || []),
                      ];
                      
                      return (
                        <div
                          key={post._id}
                          className="group relative bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow aspect-square"
                        >
                          {allImages.length > 0 ? (
                            <img
                              src={allImages[0]}
                              alt="post"
                              className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                              <span className="text-4xl">📄</span>
                            </div>
                          )}

                          {allImages.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              +{allImages.length}
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                            <div className="text-white text-center text-xs px-2">
                              <p className="font-semibold mb-1 line-clamp-2">{post.text || "No caption"}</p>
                              <p className="text-xs">❤️ {post.likes?.length || 0} · 💬 {post.comments?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasMorePosts && (
                    <button
                      onClick={() => setPostsToShow((prev) => prev + 9)}
                      className="w-full text-center py-2 text-[#0A66C2] font-semibold hover:bg-blue-50 rounded-lg transition-colors"
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
              <p className="text-sm text-[#666666]">{user?.bio || "No bio added."}</p>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3">Connections</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-2xl font-semibold text-gray-900">{user?.followers?.length || 0}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-2xl font-semibold text-gray-900">{user?.following?.length || 0}</p>
                  <p className="text-gray-500">Following</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h2 className="text-lg font-semibold mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.length > 0 ? (
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
