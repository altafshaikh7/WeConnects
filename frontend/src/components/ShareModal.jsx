import React, { useState, useEffect } from "react";

const ShareModal = ({ isOpen, onClose, post }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const postUrl = `${window.location.origin}/posts/${post._id}`;
  const postText = post.text || "Check out this post";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = (platform) => {
    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(postText + "\n\n" + postUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postText)}`;
        break;
      case "instagram":
        handleCopyLink();
        setTimeout(() => onClose(), 500);
        return;
      case "messages":
        if (navigator.share) {
          navigator.share({ title: "Post", text: postText, url: postUrl });
          onClose();
        }
        return;
      case "gmail":
        shareUrl = `mailto:?subject=Check out this post&body=${encodeURIComponent(postText + "\n\n" + postUrl)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      onClose();
    }
  };

  const shareOptions = [
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      ),
      bg: "bg-green-500",
      color: "text-green-500"
    },
    { 
      id: "twitter", 
      name: "Twitter", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.686-11.835c0-.213 0-.426-.015-.637a9.994 9.994 0 002.463-2.55z"/>
        </svg>
      ),
      bg: "bg-black",
      color: "text-gray-900"
    },
    { 
      id: "facebook", 
      name: "Facebook", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bg: "bg-blue-600",
      color: "text-blue-600"
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
        </svg>
      ),
      bg: "bg-blue-700",
      color: "text-blue-700"
    },
    { 
      id: "telegram", 
      name: "Telegram", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.065-1.226-.461-1.901-.903-1.056-.691-1.653-1.121-2.678-1.795-1.185-.777-.417-1.204.258-1.902.176-.181 3.236-2.967 3.295-3.22.007-.03.014-.141-.052-.2-.067-.059-.166-.039-.237-.023-.101.023-1.707 1.085-4.818 3.185-.456.313-.87.466-1.24.457-.408-.009-1.193-.231-1.777-.42-.716-.233-1.285-.357-1.235-.753.025-.207.311-.419.856-.635 2.199-.957 3.789-1.586 4.771-1.888 2.271-.7 2.743-.822 3.051-.823.068 0 .22.015.319.095.084.067.106.157.116.207.011.05.009.162-.005.266z"/>
        </svg>
      ),
      bg: "bg-blue-400",
      color: "text-blue-500"
    },
    { 
      id: "instagram", 
      name: "Instagram", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
        </svg>
      ),
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      color: "text-pink-600"
    },
    { 
      id: "gmail", 
      name: "Gmail", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z"/>
        </svg>
      ),
      bg: "bg-red-500",
      color: "text-red-500"
    },
    { 
      id: "messages", 
      name: "Messages", 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
        </svg>
      ),
      bg: "bg-blue-500",
      color: "text-blue-500"
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${
          isAnimating ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Mobile: Bottom Sheet | Desktop: Center Modal */}
      <div
        className={`
          fixed z-50 transition-all duration-300 transform
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:rounded-2xl md:max-w-md md:w-full
          bottom-0 left-0 right-0 rounded-t-2xl
          bg-white shadow-2xl
          ${isAnimating ? "translate-y-0 md:scale-100" : "translate-y-full md:scale-95"}
        `}
      >
        {/* Drag Handle - Only Mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-center">Share</h2>
          <p className="text-xs text-gray-500 text-center mt-0.5">
            Share this post with your network
          </p>
        </div>

        {/* Share Options - Grid Layout */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4 md:gap-5">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${option.bg} rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 group-hover:scale-105`}>
                  {option.icon}
                </div>
                <span className="text-xs text-gray-600 font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="px-5">
          <div className="border-t border-gray-100"></div>
        </div>

        {/* Copy Link Option */}
        <div className="p-5 pt-4">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition">
                {isCopied ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {isCopied ? "Copied to clipboard!" : "Copy link"}
                </p>
                <p className="text-xs text-gray-500">
                  Copy post link to share anywhere
                </p>
              </div>
            </div>
            {!isCopied && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Cancel Button */}
        <div className="px-5 pb-5 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default ShareModal;