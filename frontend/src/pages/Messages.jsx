import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Search, Send, User, ArrowLeft, MessageCircle } from "lucide-react";
import {
  emitSocketEvent,
  initSocket,
  onReceiveMessage,
  onTyping,
} from "../utils/socketClient";

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
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const upsertConversation = (user, text, incrementUnread = false, time = new Date()) => {
    if (!user?._id) return;

    setConversations((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const previousConversation = existing.find((conv) => conv?.user?._id === user._id);
      const rest = existing.filter((conv) => conv?.user?._id !== user._id);

      return [
        {
          user: previousConversation?.user || user,
          lastMessage: text,
          lastMessageTime: time,
          unreadCount: incrementUnread
            ? (previousConversation?.unreadCount || 0) + 1
            : previousConversation?.unreadCount || 0,
        },
        ...rest,
      ];
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser?._id || !token) return;

    initSocket(currentUser._id);

    const unsubscribeMessage = onReceiveMessage((incomingMessage) => {
      const senderId = String(incomingMessage.sender?._id || incomingMessage.sender || "");
      const isCurrentConversation = String(selectedUser?._id || "") === senderId;
      const senderUser = incomingMessage.sender || { _id: senderId };

      upsertConversation(
        senderUser,
        incomingMessage.text,
        !isCurrentConversation,
        incomingMessage.createdAt || new Date()
      );

      if (isCurrentConversation) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    });

    const unsubscribeTyping = onTyping((payload) => {
      if (String(payload.from || "") === String(selectedUser?._id || "")) {
        setIsTyping(Boolean(payload.isTyping));
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [currentUser?._id, selectedUser?._id, token]);

  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [API, token]);

  useEffect(() => {
    if (!token) return;

    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/search/users?query=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        const conversationUserIds = conversations.map((c) => c.user?._id).filter(Boolean);
        const filteredUsers = data.filter(
          (user) => user?._id && !conversationUserIds.includes(user._id) && user._id !== currentUser._id
        );
        setSearchResults(filteredUsers);
        setShowSearchResults(filteredUsers.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, conversations, API, token, currentUser._id]);

  useEffect(() => {
    if (!selectedUser?._id || !token) return;

    const fetchMessages = async () => {
      try {
        setError("");
        const res = await axios.get(`${API}/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        setMessages(Array.isArray(res.data) ? res.data : []);

        await axios.put(
          `${API}/messages/read-all/${selectedUser._id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        setConversations((prev) =>
          prev.map((conv) =>
            conv?.user?._id === selectedUser._id ? { ...conv, unreadCount: 0 } : conv
          )
        );
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedUser?._id, API, token]);

  const startNewConversation = (user) => {
    if (!user?._id) return;
    setSelectedUser(user);
    setSearchQuery("");
    setShowSearchResults(false);
    setError("");
    if (window.innerWidth < 768) {
      setShowMobileChat(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser?._id) return;

    try {
      const res = await axios.post(
        `${API}/messages/send`,
        { recipientId: selectedUser._id, text: messageText },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      const sentMessage = res.data?.message;
      if (!sentMessage?._id) return;

      setMessages((prev) => [...prev, sentMessage]);
      upsertConversation(selectedUser, sentMessage.text, false, sentMessage.createdAt || new Date());
      setMessageText("");
      setIsTyping(false);

    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    }
  };

  const handleTyping = (nextValue) => {
    setMessageText(nextValue);

    if (!selectedUser?._id) return;

    emitSocketEvent("typing", {
      to: selectedUser._id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitSocketEvent("typing", {
        to: selectedUser._id,
        isTyping: false,
      });
    }, 1200);
  };

  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter((conv) =>
        conv?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${
                showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search or start new chat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      <div className="p-2">
                        <p className="text-xs text-gray-500 px-2 py-1">Start new conversation</p>
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => startNewConversation(user)}
                            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <img
                              src={
                                user.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=0A66C2&color=fff`
                              }
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.headline || "Professional"}
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
                  <div className="p-8 text-center">
                    <User size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">Search for someone to start messaging</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.user?._id}
                      onClick={() => {
                        setSelectedUser(conv.user);
                        setError("");
                        if (window.innerWidth < 768) {
                          setShowMobileChat(true);
                        }
                      }}
                      className={`w-full px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 ${
                        selectedUser?._id === conv.user?._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <img
                        src={
                          conv.user?.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user?.name || "User")}&background=0A66C2&color=fff`
                        }
                        alt={conv.user?.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                          {conv.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.lastMessage || "Start a conversation"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className={`flex-1 flex flex-col bg-gray-50 ${showMobileChat ? "flex" : "hidden md:flex"}`}>
              {selectedUser ? (
                <>
                  <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft size={20} className="text-gray-600" />
                      </button>
                      <img
                        src={
                          selectedUser.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || "User")}&background=0A66C2&color=fff`
                        }
                        alt={selectedUser.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-900">
                          {selectedUser.name}
                        </p>
                        {isTyping && <p className="text-xs text-blue-600">Typing...</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <MessageCircle size={24} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isOwn = String(msg.sender?._id || msg.sender) === String(currentUser._id);
                        return (
                          <div key={msg._id || idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? "order-1" : "order-2"}`}>
                              <div
                                className={`px-3 py-2 rounded-lg ${
                                  isOwn
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                                }`}
                              >
                                <p className="text-sm break-words">{msg.text}</p>
                              </div>
                              <p className={`text-xs mt-1 ${isOwn ? "text-right text-gray-500" : "text-left text-gray-400"}`}>
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Just now"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-3 sm:p-4">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-700">Select a conversation</p>
                  <p className="text-sm text-gray-500 mt-1">Choose someone from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default Messages;
