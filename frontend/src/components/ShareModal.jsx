import React, { useState } from "react";

const ShareModal = ({ isOpen, onClose, post }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const postUrl = `${window.location.origin}/posts/${post._id}`;
  const postText = post.text || "Check out this post";
  const shareText = `${postText}\n\n${postUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  const handleShareInstagram = () => {
    // Instagram doesn't support direct web sharing, so we copy the link
    handleCopyLink();
    alert("Link copied! You can paste it on your Instagram story or DM.");
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LinkedIn Clone Post",
          text: postText,
          url: postUrl,
        });
        onClose();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Share post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-2">
          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-3.15 0-5.747 2.586-5.747 5.735 0 1.263.275 2.503.802 3.696l-1.265 3.855 3.993-1.262c1.082.559 2.368.893 3.757.893 3.15 0 5.747-2.586 5.747-5.735 0-1.529-.6-2.968-1.681-4.053-1.081-1.084-2.52-1.68-4.053-1.68" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-500">Share on WhatsApp</p>
            </div>
          </button>

          {/* Instagram */}
          <button
            onClick={handleShareInstagram}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Instagram</p>
              <p className="text-sm text-gray-500">Copy to share on Instagram</p>
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {isCopied ? "Copied! ✓" : "Copy link"}
              </p>
              <p className="text-sm text-gray-500">Copy post link to clipboard</p>
            </div>
          </button>

          {/* Native Share (if available) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-t border-gray-200 mt-2 pt-3"
            >
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">More options</p>
                <p className="text-sm text-gray-500">Share using your device</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
