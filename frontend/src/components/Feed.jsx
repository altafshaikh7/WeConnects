import { useEffect, useState } from "react";
import axios from "axios";
import CreatePostModal from "./CreatePostModal";
import { Image as ImageIcon, CalendarDays, FileText } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 🔥 FETCH POSTS
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-[560px] mx-auto">

      {/* CREATE POST */}
      <div className="bg-white rounded-xl shadow-sm border mb-4 p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://via.placeholder.com/150"
            className="w-12 h-12 rounded-full"
          />

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left border border-gray-400 rounded-full px-4 py-3 text-gray-600 hover:bg-gray-100"
          >
            Start a post
          </button>
        </div>

        <div className="grid grid-cols-3 mt-4 text-sm text-gray-600">
          <button onClick={() => setShowModal(true)}>
            <ImageIcon size={18} /> Media
          </button>

          <button onClick={() => setShowModal(true)}>
            <CalendarDays size={18} /> Event
          </button>

          <button onClick={() => setShowModal(true)}>
            <FileText size={18} /> Article
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
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden"
        >
          <div className="p-4">

            {/* 🔥 USER INFO */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  post.user?.profileImage ||
                  "https://via.placeholder.com/150"
                }
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h4 className="font-semibold text-gray-900">
                  {post.user?.name || "Unknown User"}
                </h4>

                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* TEXT */}
            {post.text && (
              <p className="text-gray-800 mb-3 whitespace-pre-wrap">
                {post.text}
              </p>
            )}
          </div>

          {/* IMAGE */}
          {post.image && (
            <img
              src={post.image}
              alt="post"
              className="w-full max-h-[500px] object-cover"
            />
          )}

          {/* STATS */}
          <div className="px-4 py-3 border-t text-sm text-gray-500 flex justify-between">
            <span>0 likes</span>
            <span>0 comments</span>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-4 border-t text-sm font-medium text-gray-600">
            <button className="py-3 hover:bg-gray-100">Like</button>
            <button className="py-3 hover:bg-gray-100">Comment</button>
            <button className="py-3 hover:bg-gray-100">Repost</button>
            <button className="py-3 hover:bg-gray-100">Send</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Feed;