import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import CreatePostModal from "./CreatePostModal";
import FollowButton from "./FollowButton";
import ImageCarousel from "./ImageCarousel";
import PostOptions from "./PostOptions";
import ShareModal from "./ShareModal";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [replies, setReplies] = useState({});
  const [openComment, setOpenComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [shareModal, setShareModal] = useState({ isOpen: false, post: null });
  const [likedPosts, setLikedPosts] = useState(new Set());
  
  const socketRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const currentUser = JSON.parse(localStorage.getItem("user")) || { _id: "" };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ================= SOCKET.IO SETUP =================
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    socketRef.current = socket;
    socket.emit("user_online", currentUser._id);
    console.log(`✅ Socket connected for user: ${currentUser._id}`);

    socket.on("receive_like", (data) => {
      const { postId, userId } = data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...(post.likes || []), userId] }
            : post
        )
      );
    });

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

    socket.on("receive_unfollow", (data) => {
      const { from } = data;
      console.log(`👋 User ${from} was unfollowed. Removing their posts...`);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => String(post?.user?._id) !== String(from))
      );
    });

    return () => {
      console.log("🧹 Cleaning up socket connection...");
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser._id]);

  // ================= FETCH POSTS =================
  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      
      const res = await axios.get(`${API}/posts`, {
        headers: getAuthHeader()
      });
      setPosts(res.data || []);
      console.log(`✅ Fetched ${res.data?.length || 0} posts`);
    } catch (err) {
      console.error("❌ Failed to fetch posts:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    }
  }, [API]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ================= LIKE HANDLER =================
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to like posts ❌");
      return;
    }

    setLikedPosts(prev => new Set(prev).add(postId));
    setTimeout(() => {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }, 300);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        const isLiked = post?.likes?.some(
          (id) => String(id) === String(currentUser._id)
        );
        return {
          ...post,
          likes: isLiked
            ? post.likes.filter((id) => String(id) !== String(currentUser._id))
            : [...(post.likes || []), currentUser._id],
        };
      })
    );

    try {
      await axios.post(
        `${API}/posts/${postId}/like`,
        {},
        { headers: getAuthHeader() }
      );
    } catch (err) {
      console.error("Like failed:", err);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;
          const isLiked = post?.likes?.some(
            (id) => String(id) === String(currentUser._id)
          );
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((id) => String(id) !== String(currentUser._id))
              : [...(post.likes || []), currentUser._id],
          };
        })
      );
      alert("Failed to update like ❌");
    }
  };

  // ================= COMMENT HANDLER =================
  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to comment ❌");
        return;
      }

      if (!comments[postId]?.trim()) {
        alert("Comment cannot be empty ❌");
        return;
      }

      const res = await axios.post(
        `${API}/search/posts/${postId}/comments`,
        { text: comments[postId] },
        { headers: getAuthHeader() }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), res.data],
              }
            : post
        )
      );

      setComments({ ...comments, [postId]: "" });
      alert("✅ Comment added");
    } catch (err) {
      console.error("Comment failed:", err);
      alert(err.response?.data?.message || "Failed to add comment ❌");
    }
  };

  // ================= DELETE COMMENT =================
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in ❌");
        return;
      }

      await axios.delete(
        `${API}/search/posts/${postId}/comments/${commentId}`,
        { headers: getAuthHeader() }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments?.filter((c) => c._id !== commentId) || [],
              }
            : post
        )
      );

      alert("✅ Comment deleted");
    } catch (err) {
      console.error("Delete comment failed:", err);
      alert(err.response?.data?.message || "Failed to delete comment ❌");
    }
  };

  // ================= REPLY HANDLER =================
  const handleReply = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to reply ❌");
        return;
      }

      const replyKey = `${postId}-${commentId}`;
      if (!replies[replyKey]?.trim()) {
        alert("Reply cannot be empty ❌");
        return;
      }

      const res = await axios.post(
        `${API}/search/posts/${postId}/comments/${commentId}/replies`,
        { text: replies[replyKey] },
        { headers: getAuthHeader() }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments?.map((c) =>
                  c._id === commentId
                    ? {
                        ...c,
                        replies: [...(c.replies || []), res.data],
                      }
                    : c
                ),
              }
            : post
        )
      );

      setReplies({ ...replies, [replyKey]: "" });
      alert("✅ Reply added");
    } catch (err) {
      console.error("Reply failed:", err);
      alert(err.response?.data?.message || "Failed to add reply ❌");
    }
  };

  // ================= DELETE POST =================
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/posts/${postId}`, {
        headers: getAuthHeader()
      });
      
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Delete post failed:", err);
      alert("Failed to delete post");
    }
  };

  // ================= HANDLE UNFOLLOW =================
  const handleUnfollow = async (userIdToUnfollow) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/users/unfollow`,
        { userId: userIdToUnfollow },
        { headers: getAuthHeader() }
      );
      
      setPosts((prevPosts) =>
        prevPosts.filter((post) => String(post?.user?._id) !== String(userIdToUnfollow))
      );
      
      alert("Unfollowed successfully");
    } catch (err) {
      console.error("Unfollow failed:", err);
      alert("Failed to unfollow");
    }
  };

  // ================= COPY LINK =================
  const handleCopyLink = (postId) => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  // ================= REFRESH FEED =================
  const handleRefreshPosts = () => {
    fetchPosts();
  };

  return (
    <div className="w-full max-w-[560px] mx-auto px-2 sm:px-4 pb-8">
      {/* CREATE POST */}
      <div className="bg-white rounded-xl border mb-4 p-4 shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => setShowModal(true)}
          className="w-full border rounded-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 transition-colors"
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
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          No posts to show. Follow some users to see their posts!
        </div>
      ) : (
        posts.map((post) => {
          const allImages = [
            ...(post?.image ? [post.image] : []),
            ...(post?.images || []),
          ];

          const isLiked = post?.likes?.some(
            (id) => String(id) === String(currentUser._id)
          );

          // ✅ CRITICAL FIX: Check if this is current user's own post
          const isOwnPost = String(post?.user?._id) === String(currentUser._id);
          
          // ✅ Check if current user is following the post author
          const isFollowing = currentUser?.following?.some(
            (followingId) => String(followingId) === String(post?.user?._id)
          ) || false;
          
          // ✅ Check if post author follows back (mutual)
          const isFollowedBack = post?.user?.following?.some(
            (followerId) => String(followerId) === String(currentUser._id)
          ) || false;
          
          // ✅ Mutual followers = both follow each other
          const isMutualFollower = isFollowing && isFollowedBack;

          return (
            <div key={post._id} className="bg-white rounded-xl border mb-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* POST HEADER */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={post?.user?.profileImage || "https://via.placeholder.com/40"}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                      onClick={() => {
                        console.log(`Navigate to profile: ${post?.user?._id}`);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate hover:text-blue-600 cursor-pointer">
                        {post?.user?.name || "User"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(post?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* ✅ CORRECTED: Follow button - ONLY for other users when NOT following */}
                    {!isOwnPost && !isFollowing && (
                      <FollowButton
                        user={post.user}
                        isFollowing={isFollowing}
                        isMutualFollower={isMutualFollower}
                        onFollowChange={handleRefreshPosts}
                      />
                    )}

                    {/* Show "Following" badge for non-mutual follows */}
                    {!isOwnPost && isFollowing && !isMutualFollower && (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-default"
                      >
                        Following
                      </button>
                    )}

                    {/* Show "Connected" badge for mutual follows */}
                    {!isOwnPost && isMutualFollower && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Connected
                      </span>
                    )}

                    <PostOptions
                      post={post}
                      onDelete={handleDeletePost}
                      onUnfollow={handleUnfollow}
                      onCopyLink={handleCopyLink}
                      currentUserId={currentUser._id}
                    />
                  </div>
                </div>

                {/* POST TEXT */}
                {post?.text && (
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}
              </div>

              {/* IMAGES */}
              {allImages.length > 0 && <ImageCarousel images={allImages} />}

              {/* STATS */}
              <div className="px-4 py-3 flex justify-between text-xs text-gray-500 border-b border-gray-100">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  👍 {post?.likes?.length || 0} {post?.likes?.length === 1 ? "like" : "likes"}
                </span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  💬 {post?.comments?.length || 0} {post?.comments?.length === 1 ? "comment" : "comments"}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-3 border-t">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`py-3 px-2 flex justify-center items-center gap-2 transition-all duration-300 rounded-lg font-medium
                    ${isLiked 
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }
                    ${likedPosts.has(post._id) ? "scale-110" : "scale-100"}
                  `}
                >
                  <ThumbsUp 
                    size={18} 
                    className={`transition-all ${isLiked ? "fill-blue-600" : ""}`}
                  />
                  <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
                </button>

                <button
                  onClick={() =>
                    setOpenComment(openComment === post._id ? null : post._id)
                  }
                  className="py-3 px-2 flex justify-center items-center gap-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-all duration-200 font-medium"
                >
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">Comment</span>
                </button>

                <button
                  onClick={() => setShareModal({ isOpen: true, post })}
                  className="py-3 px-2 flex justify-center items-center gap-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all duration-200 font-medium"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* COMMENTS SECTION */}
              {openComment === post._id && (
                <div className="px-4 pb-3 border-t bg-gray-50 rounded-b-xl">
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
                      className="flex-1 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="text-blue-600 text-sm font-semibold hover:underline px-3 py-2"
                    >
                      Post
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                    {post?.comments?.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      post?.comments?.map((c, i) => {
                        const replyKey = `${post._id}-${c._id}`;
                        const isCommentOwner = String(c?.user?._id) === String(currentUser._id);
                        
                        return (
                          <div key={i} className="border-l-2 border-blue-300 pl-3">
                            <div className="flex gap-2">
                              <img
                                src={c?.user?.profileImage || "https://via.placeholder.com/32"}
                                alt="user"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                  <p className="font-semibold text-sm">
                                    {c?.user?.name || "User"}
                                  </p>
                                  <p className="text-sm text-gray-800 mt-1">{c.text}</p>
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
                                      : `${c.replies?.length || 0} ${c.replies?.length === 1 ? "reply" : "replies"}`}
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

                            {expandedReplies[replyKey] && (
                              <div className="mt-2 ml-4 space-y-2">
                                {c.replies?.map((r, j) => (
                                  <div key={j} className="flex gap-2">
                                    <img
                                      src={r?.user?.profileImage || "https://via.placeholder.com/28"}
                                      alt="user"
                                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <div className="bg-gray-50 rounded-lg px-2 py-1">
                                        <p className="font-semibold text-xs">
                                          {r?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-gray-800 mt-1">{r.text}</p>
                                      </div>
                                      <div className="flex gap-2 mt-1 text-xs text-gray-600">
                                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

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
                                    className="flex-1 border px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleReply(post._id, c._id);
                                      }
                                    }}
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
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, post: null })}
        post={shareModal.post}
      />
    </div>
  );
}

export default Feed;