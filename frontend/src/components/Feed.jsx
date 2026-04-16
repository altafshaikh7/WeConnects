import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import CreatePostModal from "./CreatePostModal";
import FollowButton from "./FollowButton";
import { ThumbsUp, MessageCircle, Share2, X } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [replies, setReplies] = useState({});
  const [openComment, setOpenComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const currentUser = JSON.parse(localStorage.getItem("user")) || { _id: "" };

  // ================= SOCKET.IO SETUP =================
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Notify server user is online
    socket.emit("user_online", currentUser._id);

    // 🔹 LISTEN FOR NEW LIKES
    socket.on("receive_like", (data) => {
      const { postId, userId, likeCount } = data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...(post.likes || []), userId] }
            : post
        )
      );
    });

    // 🔹 LISTEN FOR UNLIKE
    socket.on("receive_unlike", (data) => {
      const { postId, userId } = data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes?.filter((id) => String(id) !== String(userId)) || [],
              }
            : post
        )
      );
    });

    // 🔹 LISTEN FOR NEW COMMENTS
    socket.on("receive_comment", (data) => {
      const { postId, comment } = data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );
    });

    // 🔹 LISTEN FOR NEW REPLIES
    socket.on("receive_reply", (data) => {
      const { postId, commentId, reply } = data;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          return {
            ...post,
            comments: post.comments?.map((c) =>
              c._id === commentId
                ? { ...c, replies: [...(c.replies || []), reply] }
                : c
            ),
          };
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser._id]);

  // ================= FETCH =================
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/posts`);
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

    const authHeader = token ? `Bearer ${token}` : "";

    // 🔥 UI UPDATE FIRST
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        const isLiked = post?.likes?.some(
          (id) => String(id) === String(currentUser._id)
        );

        return {
          ...post,
          likes: isLiked
            ? post.likes.filter(
                (id) => String(id) !== String(currentUser._id)
              )
            : [...post.likes, currentUser._id],
        };
      })
    );

    // 🔥 BACKEND CALL
    try {
      const res = await axios.post(
        `${API}/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: authHeader },
        }
      );

      const updatedPost = res.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch (err) {
      console.log("Like failed:", err);
      fetchPosts(); // fallback
    }
  };

  // ================= 🤝 FOLLOW / CONNECT =================
  // Removed - using FollowButton component now
  const handleRefreshPosts = () => {
    fetchPosts();
  };

  // ================= COMMENT =================
  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? `Bearer ${token}` : "";

      if (!comments[postId]?.trim()) return;

      const res = await axios.post(
        `${API}/search/posts/${postId}/comments`,
        { text: comments[postId] },
        {
          headers: { Authorization: authHeader },
        }
      );

      fetchPosts(); // Refresh posts
      setComments({ ...comments, [postId]: "" });
      alert("Comment added ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to add comment ❌");
    }
  };

  // ================= DELETE COMMENT =================
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? `Bearer ${token}` : "";

      await axios.delete(
        `${API}/search/posts/${postId}/comments/${commentId}`,
        {
          headers: { Authorization: authHeader },
        }
      );

      fetchPosts();
      alert("Comment deleted ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to delete comment ❌");
    }
  };
  const handleReply = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? `Bearer ${token}` : "";

      const replyKey = `${postId}-${commentId}`;
      if (!replies[replyKey]?.trim()) return;

      const res = await axios.post(
        `${API}/search/posts/${postId}/comments/${commentId}/replies`,
        { text: replies[replyKey] },
        {
          headers: { Authorization: authHeader },
        }
      );

      fetchPosts(); // Refresh posts
      setReplies({ ...replies, [replyKey]: "" });
      alert("Reply added ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to add reply ❌");
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
          (id) => String(id) === String(currentUser._id)
        );

       return (
  <div key={post._id} className="bg-white rounded-xl border mb-4">

    <div className="p-4">
      {/* ✅ UPDATED HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <img
            src={post?.user?.profileImage || "https://via.placeholder.com/40"}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h4 className="font-semibold">
            {post?.user?.name || "User"}
          </h4>
        </div>

        {/* ✅ FOLLOW BUTTON SHIFTED HERE */}
        {post.user._id !== currentUser._id && (
          <FollowButton
            user={post.user}
            isFollowing={currentUser?.following?.includes(post.user._id)}
            onFollowChange={handleRefreshPosts}
          />
        )}

      </div>

      {post?.text && <p className="mt-2">{post.text}</p>}
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
    <div className="grid grid-cols-3 border-t text-sm">

      {/* LIKE */}
      <button
        onClick={() => handleLike(post._id)}
        className={`py-2 flex justify-center items-center gap-1 transition
          ${isLiked ? "text-blue-600 font-semibold scale-105" : "text-gray-600"}
        `}
      >
        <ThumbsUp size={18} />
        Like
      </button>

      {/* COMMENT */}
      <button
        onClick={() =>
          setOpenComment(openComment === post._id ? null : post._id)
        }
        className="py-2 flex justify-center items-center gap-1 text-gray-600"
      >
        <MessageCircle size={18} />
        Comment
      </button>

      {/* ❌ FOLLOW BUTTON REMOVED FROM HERE */}

      <button className="py-2 flex justify-center items-center gap-1 text-gray-600 hover:text-blue-600">
        <Share2 size={18} />
        Share
      </button>
    </div>

    {/* COMMENTS SECTION */}
    {openComment === post._id && (
      <div className="px-4 pb-3 border-t">

        {/* ADD COMMENT */}
        <div className="flex gap-2 mt-3">
          <input
            value={comments[post._id] || ""}
            onChange={(e) =>
              setComments({
                ...comments,
                [post._id]: e.target.value,
              })
            }
            placeholder="Add a comment..."
            className="flex-1 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={() => handleComment(post._id)}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            Post
          </button>
        </div>

        {/* DISPLAY COMMENTS WITH REPLIES */}
        <div className="mt-4 space-y-3">
          {post?.comments?.map((c, i) => {
            const replyKey = `${post._id}-${c._id}`;
            const isCommentOwner = String(c?.user?._id) === String(currentUser._id);
            
            return (
              <div key={i} className="border-l-2 border-blue-300 pl-3">
                {/* COMMENT */}
                <div className="flex gap-2">
                  <img
                    src={
                      c?.user?.profileImage ||
                      "https://via.placeholder.com/32"
                    }
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <p className="font-semibold text-sm">
                        {c?.user?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-800">{c.text}</p>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() =>
                          setExpandedReplies({
                            ...expandedReplies,
                            [replyKey]: !expandedReplies[replyKey],
                          })
                        }
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {expandedReplies[replyKey]
                          ? "Hide"
                          : `${c.replies?.length || 0} replies`}
                      </button>
                      {isCommentOwner && (
                        <button
                          onClick={() => handleDeleteComment(post._id, c._id)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                        {/* REPLIES */}
                        {expandedReplies[replyKey] && (
                          <div className="mt-2 ml-4 space-y-2">
                            {c.replies?.map((r, j) => (
                              <div key={j} className="flex gap-2">
                                <img
                                  src={
                                    r?.user?.profileImage ||
                                    "https://via.placeholder.com/28"
                                  }
                                  alt="user"
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-lg px-2 py-1">
                                    <p className="font-semibold text-xs">
                                      {r?.user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-800">{r.text}</p>
                                  </div>
                                  <div className="flex gap-2 mt-1 text-xs text-gray-600">
                                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* ADD REPLY INPUT */}
                            <div className="flex gap-2 mt-2 ml-4">
                              <input
                                value={replies[replyKey] || ""}
                                onChange={(e) =>
                                  setReplies({
                                    ...replies,
                                    [replyKey]: e.target.value,
                                  })
                                }
                                placeholder="Write a reply..."
                                className="flex-1 border px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                              <button
                                onClick={() => handleReply(post._id, c._id)}
                                className="text-blue-600 text-xs font-semibold hover:underline"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

export default Feed;