import { useEffect, useState } from "react";
import axios from "axios";
import CreatePostModal from "./CreatePostModal";
import { Image as ImageIcon, CalendarDays, FileText } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // FETCH POSTS
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-[560px] mx-auto px-2 sm:px-4">

      {/* CREATE POST */}
      <div className="bg-white rounded-xl shadow-sm border mb-4 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://via.placeholder.com/150"
            className="w-12 h-12 rounded-full object-cover"
          />

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left border border-gray-300 rounded-full px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
          >
            Start a post
          </button>
        </div>

        <div className="grid grid-cols-3 mt-4 text-sm text-gray-600">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded"
          >
            <ImageIcon size={16} />
            Media
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded"
          >
            <CalendarDays size={16} />
            Event
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded"
          >
            <FileText size={16} />
            Article
          </button>
        </div>
      </div>

      {/* MODAL */}
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPostCreated={fetchPosts}
      />

      {/* POSTS */}
      {posts.map((post) => {

        // 🔥 merge old + new images
        const allImages = [
          ...(post?.image ? [post.image] : []),
          ...(Array.isArray(post?.images) ? post.images : [])
        ];

        return (
          <div
            key={post._id}
            className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden"
          >
            <div className="p-4">

              {/* USER */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    post?.user?.profileImage ||
                    `https://ui-avatars.com/api/?name=${post?.user?.name}`
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <h4 className="font-semibold text-gray-900">
                    {post?.user?.name || "Unknown User"}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {post?.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>

              {/* TEXT */}
              {post?.text && (
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">
                  {post.text}
                </p>
              )}
            </div>

            {/* 🔥 IMAGE SECTION */}
            {allImages.length > 0 && (
              <div className="px-4 pb-3">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="post"
                    className="w-full rounded-lg mb-2 object-cover"
                    onError={(e) => {
                      console.log("Broken image:", img);
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            )}

            {/* STATS */}
            <div className="px-4 py-2 border-t text-sm text-gray-500 flex justify-between">
              <span>0 likes</span>
              <span>0 comments</span>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-4 border-t text-sm text-gray-600">
              <button className="py-2 hover:bg-gray-100">Like</button>
              <button className="py-2 hover:bg-gray-100">Comment</button>
              <button className="py-2 hover:bg-gray-100">Repost</button>
              <button className="py-2 hover:bg-gray-100">Send</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Feed;