import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import { Search, X } from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  // Initialize Socket.io
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected for messaging ✅");
      newSocket.emit("user_online", currentUser._id);
    });

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          sender: data.from,
          text: data.message,
          createdAt: data.timestamp,
        },
      ]);
    });

    newSocket.on("user_typing", (data) => {
      setIsTyping(data.isTyping);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, currentUser._id, navigate]);

  // 🔍 SEARCH FOR NEW USERS TO START CONVERSATION
  useEffect(() => {
    if (!token) return;

    const searchUsers = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/search/users?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter out users already in conversations
        const conversationUserIds = conversations.map((c) => c.user._id);
        const filteredUsers = res.data.filter(
          (user) =>
            !conversationUserIds.includes(user._id) &&
            user._id !== currentUser._id
        );

        setSearchResults(filteredUsers || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, API, token, conversations, currentUser._id]);

  const startNewConversation = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Fetch conversations when user is selected
  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [API, token]);

  // Fetch messages when user is selected
  useEffect(() => {
    if (!selectedUser?._id || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API}/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);

        // Mark all messages as read
        await axios.put(
          `${API}/messages/read-all/${selectedUser._id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedUser, API, token]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUser) return;

    try {
      const res = await axios.post(
        `${API}/messages/send`,
        {
          recipientId: selectedUser._id,
          text: messageText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) => [...prev, res.data]);
      setMessageText("");

      // Emit real-time message via Socket.io
      if (socket) {
        socket.emit("send_message", {
          to: selectedUser._id,
          message: messageText,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit("typing", {
        to: selectedUser._id,
        isTyping: true,
      });

      // Stop typing after 2 seconds of inactivity
      setTimeout(() => {
        socket.emit("typing", {
          to: selectedUser._id,
          isTyping: false,
        });
      }, 2000);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[#666666]">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F3F2EF] min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-[1fr_2fr] gap-4 h-[calc(100vh-120px)]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-3">Conversations</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Search or start new conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#0A66C2]"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    <div className="p-2">
                      <p className="text-xs text-gray-600 px-2 py-1 font-semibold">
                        Start new conversation
                      </p>
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => startNewConversation(user)}
                          className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                          <img
                            src={
                              user.profileImage ||
                              "https://via.placeholder.com/40"
                            }
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-gray-600 truncate">
                              {user.headline}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-[#666666]">
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.user._id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full px-4 py-3 border-b text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      selectedUser?._id === conv.user._id
                        ? "bg-blue-50 border-l-4 border-l-[#0A66C2]"
                        : ""
                    }`}
                  >
                    <img
                      src={conv.user.profileImage || "https://via.placeholder.com/40"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{conv.user.name}</p>
                      <p className="text-xs text-[#666666] truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[#0A66C2] text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.profileImage || "https://via.placeholder.com/40"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{selectedUser.name}</p>
                      {isTyping && <p className="text-xs text-[#666666]">typing...</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#666666]" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#666666]">
                      <p className="text-sm">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          String(msg.sender?._id || msg.sender) ===
                          String(currentUser._id)
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            String(msg.sender?._id || msg.sender) ===
                            String(currentUser._id)
                              ? "bg-[#0A66C2] text-white rounded-br-none"
                              : "bg-gray-200 text-black rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              String(msg.sender?._id || msg.sender) ===
                              String(currentUser._id)
                                ? "text-blue-100"
                                : "text-gray-600"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t flex gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#0A66C2]"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="px-6 py-2 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#0952A4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-[#666666]">
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
