import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";
import FollowButton from "./FollowButton";
import ImageCarousel from "./ImageCarousel";
import PostOptions from "./PostOptions";
import ShareModal from "./ShareModal";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import {
  initSocket,
  onLikeUpdate,
  onCommentUpdate,
  onReplyUpdate,
  onConnectionUpdate,
  onPostDeleted,
} from "../utils/socketClient";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [replies, setReplies] = useState({});
  const [openComment, setOpenComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [shareModal, setShareModal] = useState({ isOpen: false, post: null });
  const [likedPosts, setLikedPosts] = useState(new Set());

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const goToProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/posts`, {
        headers: getAuthHeader(),
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [API]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchPosts]);

  useEffect(() => {
    if (!currentUser?._id) return;

    initSocket(currentUser._id);

    const unsubscribeLike = onLikeUpdate((payload) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === payload.postId ? { ...post, ...payload.post } : post
        )
      );
    });

    const unsubscribeComment = onCommentUpdate((payload) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== payload.postId) return post;

          if (payload.post) {
            return { ...post, ...payload.post };
          }

          if (payload.action === "deleted") {
            return {
              ...post,
              comments: (post.comments || []).filter((comment) => comment._id !== payload.commentId),
            };
          }

          return {
            ...post,
            comments: [...(post.comments || []), payload.comment],
          };
        })
      );
    });

    const unsubscribeReply = onReplyUpdate((payload) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== payload.postId) return post;
          return {
            ...post,
            comments: (post.comments || []).map((comment) =>
              comment._id === payload.commentId
                ? { ...comment, replies: [...(comment.replies || []), payload.reply] }
                : comment
            ),
          };
        })
      );
    });

    const unsubscribeConnection = onConnectionUpdate((payload) => {
      if (payload.action === "unfollowed") {
        setPosts((prevPosts) =>
          prevPosts.filter((post) => String(post?.user?._id) !== String(payload.to))
        );
      }
    });

    const unsubscribePostDeleted = onPostDeleted((payload) => {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== payload.postId));
    });

    return () => {
      unsubscribeLike();
      unsubscribeComment();
      unsubscribeReply();
      unsubscribeConnection();
      unsubscribePostDeleted();
    };
  }, [currentUser?._id]);

  const handleLike = async (postId) => {
    const currentUserId = currentUser._id;

    setLikedPosts((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 300);

    const snapshot = posts;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;
        const isLiked = post.likes?.some((id) => String(id) === String(currentUserId));
        return {
          ...post,
          likes: isLiked
            ? post.likes.filter((id) => String(id) !== String(currentUserId))
            : [...(post.likes || []), currentUserId],
        };
      })
    );

    try {
      const res = await axios.post(`${API}/posts/${postId}/like`, {}, { headers: getAuthHeader() });
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data.post : post))
      );
    } catch (err) {
      console.error("Like failed:", err);
      setPosts(snapshot);
      alert("Failed to update like");
    }
  };

  const handleComment = async (postId) => {
    if (!comments[postId]?.trim()) return;

    try {
      const res = await axios.post(
        `${API}/search/posts/${postId}/comments`,
        { text: comments[postId] },
        { headers: getAuthHeader() }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), res.data.comment] }
            : post
        )
      );
      setComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment failed:", err);
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axios.delete(`${API}/search/posts/${postId}/comments/${commentId}`, {
        headers: getAuthHeader(),
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: (post.comments || []).filter((comment) => comment._id !== commentId),
              }
            : post
        )
      );
    } catch (err) {
      console.error("Delete comment failed:", err);
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleReply = async (postId, commentId) => {
    const replyKey = `${postId}-${commentId}`;
    if (!replies[replyKey]?.trim()) return;

    try {
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
                comments: (post.comments || []).map((comment) =>
                  comment._id === commentId
                    ? { ...comment, replies: [...(comment.replies || []), res.data.reply] }
                    : comment
                ),
              }
            : post
        )
      );
      setReplies((prev) => ({ ...prev, [replyKey]: "" }));
    } catch (err) {
      console.error("Reply failed:", err);
      alert(err.response?.data?.message || "Failed to add reply");
    }
  };

  const handleDeletePost = async (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  const handleUnfollow = async (userIdToUnfollow) => {
    try {
      await axios.post(
        `${API}/users/${userIdToUnfollow}/unfollow`,
        {},
        { headers: getAuthHeader() }
      );

      setPosts((prevPosts) =>
        prevPosts.filter((post) => String(post?.user?._id) !== String(userIdToUnfollow))
      );
    } catch (err) {
      console.error("Unfollow failed:", err);
      alert("Failed to unfollow");
    }
  };

  const handleCopyLink = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    alert("Link copied to clipboard");
  };

  return (
    <div className="w-full max-w-[560px] mx-auto px-2 sm:px-4 pb-8">
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

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          No posts to show. Follow some users to see their posts!
        </div>
      ) : (
        posts.map((post) => {
          const allImages = [...(post?.image ? [post.image] : []), ...(post?.images || [])];
          const isLiked = post?.likes?.some((id) => String(id) === String(currentUser._id));
          const isOwnPost = String(post?.user?._id) === String(currentUser._id);

          return (
            <div key={post._id} className="bg-white rounded-xl border mb-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={post?.user?.profileImage || "https://via.placeholder.com/40"}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                      onClick={() => goToProfile(post?.user?._id || post?.user)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold text-sm truncate hover:text-blue-600 cursor-pointer"
                        onClick={() => goToProfile(post?.user?._id || post?.user)}
                      >
                        {post?.user?.name || "User"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(post?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isOwnPost && (
                      <FollowButton
                        user={post.user}
                        isFollowing={post.user?.followers?.some?.(
                          (id) => String(id) === String(currentUser._id)
                        )}
                        onFollowChange={fetchPosts}
                      />
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

                {post?.text && (
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
                )}
              </div>

              {allImages.length > 0 && <ImageCarousel images={allImages} />}

              <div className="px-4 py-3 flex justify-between text-xs text-gray-500 border-b border-gray-100">
                <span>{post?.likes?.length || 0} likes</span>
                <span>{post?.comments?.length || 0} comments</span>
              </div>

              <div className="grid grid-cols-3 border-t">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`py-3 px-2 flex justify-center items-center gap-2 transition-all duration-300 rounded-lg font-medium ${
                    isLiked
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  } ${likedPosts.has(post._id) ? "scale-110" : "scale-100"}`}
                >
                  <ThumbsUp size={18} className={`transition-all ${isLiked ? "fill-blue-600" : ""}`} />
                  <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
                </button>

                <button
                  onClick={() => setOpenComment(openComment === post._id ? null : post._id)}
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

              {openComment === post._id && (
                <div className="px-4 pb-3 border-t bg-gray-50 rounded-b-xl">
                  <div className="flex gap-2 mt-3">
                    <input
                      value={comments[post._id] || ""}
                      onChange={(e) => setComments((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Add a comment..."
                      className="flex-1 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      onKeyDown={(e) => {
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
                    {(post?.comments || []).map((comment, index) => {
                      const replyKey = `${post._id}-${comment._id}`;
                      const isCommentOwner =
                        String(comment?.user?._id || comment?.user) === String(currentUser._id);

                      return (
                        <div key={comment._id || index} className="border-l-2 border-blue-300 pl-3">
                          <div className="flex gap-2">
                            <img
                              src={comment?.user?.profileImage || "https://via.placeholder.com/32"}
                              alt="user"
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                              onClick={() => navigate(`/profile/${comment?.user?._id}`)}
                            />
                            <div className="flex-1">
                              <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                <p
                                  className="font-semibold text-sm cursor-pointer hover:text-blue-600"
                                  onClick={() => navigate(`/profile/${comment?.user?._id}`)}
                                >
                                  {comment?.user?.name || "User"}
                                </p>
                                <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                              </div>
                              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                <button
                                  onClick={() =>
                                    setExpandedReplies((prev) => ({
                                      ...prev,
                                      [replyKey]: !prev[replyKey],
                                    }))
                                  }
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {expandedReplies[replyKey]
                                    ? "Hide"
                                    : `${comment.replies?.length || 0} replies`}
                                </button>
                                {isCommentOwner && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, comment._id)}
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
                              {(comment.replies || []).map((reply, replyIndex) => (
                                <div key={reply._id || replyIndex} className="flex gap-2">
                                  <img
                                    src={reply?.user?.profileImage || "https://via.placeholder.com/28"}
                                    alt="user"
                                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 cursor-pointer"
                                    onClick={() => navigate(`/profile/${reply?.user?._id}`)}
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg px-2 py-1">
                                      <p
                                        className="font-semibold text-xs cursor-pointer hover:text-blue-600"
                                        onClick={() => navigate(`/profile/${reply?.user?._id}`)}
                                      >
                                        {reply?.user?.name || "User"}
                                      </p>
                                      <p className="text-xs text-gray-800 mt-1">{reply.text}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <div className="flex gap-2 mt-2 ml-4">
                                <input
                                  value={replies[replyKey] || ""}
                                  onChange={(e) =>
                                    setReplies((prev) => ({ ...prev, [replyKey]: e.target.value }))
                                  }
                                  placeholder="Write a reply..."
                                  className="flex-1 border px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleReply(post._id, comment._id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleReply(post._id, comment._id)}
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
