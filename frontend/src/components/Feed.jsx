import { useEffect, useState } from "react";
import axios from "axios";
import CreatePostModal from "./CreatePostModal";
import { ThumbsUp, MessageCircle } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [openComment, setOpenComment] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  // ✅ SAFE USER
  const currentUser =
    JSON.parse(localStorage.getItem("user")) || { _id: "" };

  // ================= FETCH =================
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/api/posts`);
      setPosts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ================= 🔥 REAL-TIME LIKE =================
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");

    // 🔥 UI UPDATE FIRST
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        const isLiked = post?.likes?.some(
          (id) => id === currentUser._id
        );

        return {
          ...post,
          likes: isLiked
            ? post.likes.filter((id) => id !== currentUser._id)
            : [...post.likes, currentUser._id],
        };
      })
    );

    // 🔥 BACKEND CALL
    try {
      await axios.post(
        `${API}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: token || "" },
        }
      );
    } catch (err) {
      console.log("Like failed:", err);
      fetchPosts(); // fallback
    }
  };

  // ================= COMMENT =================
  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      if (!comments[postId]?.trim()) return;

      await axios.post(
        `${API}/api/posts/${postId}/comment`,
        { text: comments[postId] },
        {
          headers: { Authorization: token || "" },
        }
      );

      setComments({ ...comments, [postId]: "" });
      fetchPosts();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto px-2 sm:px-4">

      {/* CREATE POST */}
      <div className="bg-white rounded-xl border mb-4 p-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full border rounded-full px-4 py-3 text-left text-gray-600"
        >
          Start a post
        </button>
      </div>

      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPostCreated={fetchPosts}
      />

      {/* POSTS */}
      {posts.map((post) => {
        const allImages = [
          ...(post?.image ? [post.image] : []),
          ...(post?.images || []),
        ];

        const isLiked = post?.likes?.some(
          (id) => id === currentUser._id
        );

        return (
          <div key={post._id} className="bg-white rounded-xl border mb-4">

            <div className="p-4">
              <h4 className="font-semibold">
                {post?.user?.name || "User"}
              </h4>

              {post?.text && <p>{post.text}</p>}
            </div>

            {/* IMAGES */}
            {allImages.map((img, i) => (
              <img key={i} src={img} className="w-full" />
            ))}

            {/* STATS */}
            <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
              <span>{post?.likes?.length || 0} likes</span>
              <span>{post?.comments?.length || 0} comments</span>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-4 border-t text-sm">

              {/* LIKE */}
              <button
                onClick={() => handleLike(post._id)}
                className={`py-2 flex justify-center items-center gap-1 transition
                  ${isLiked ? "text-blue-600 font-semibold scale-105" : "text-gray-600"}
                `}
              >
                <ThumbsUp size={18} />
                {post?.likes?.length || 0}
              </button>

              {/* COMMENT */}
              <button
                onClick={() =>
                  setOpenComment(openComment === post._id ? null : post._id)
                }
                className="py-2 flex justify-center items-center gap-1 text-gray-600"
              >
                <MessageCircle size={18} />
              </button>

              <button className="py-2">Repost</button>
              <button className="py-2">Send</button>
            </div>

            {/* COMMENTS */}
            {openComment === post._id && (
              <div className="px-4 pb-3">

                <div className="flex gap-2 mt-2">
                  <input
                    value={comments[post._id] || ""}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [post._id]: e.target.value,
                      })
                    }
                    placeholder="Add a comment..."
                    className="flex-1 border px-2 py-1 rounded text-sm"
                  />

                  <button
                    onClick={() => handleComment(post._id)}
                    className="text-blue-600 text-sm font-semibold"
                  >
                    Post
                  </button>
                </div>

                {post?.comments?.map((c, i) => (
                  <div key={i} className="text-sm mt-2">
                    <b>{c?.user?.name || "User"}:</b> {c.text}
                  </div>
                ))}

              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default Feed;