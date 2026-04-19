import React, { useState } from "react";

const VisibilityModal = ({ isOpen, onClose, onSelect, currentVisibility = "public" }) => {
  const [selected, setSelected] = useState(currentVisibility);

  if (!isOpen) return null;

  const visibilityOptions = [
    {
      id: "public",
      label: "Anyone 🌍",
      description: "Anyone on LinkedIn Clone can see this post",
      icon: "🌐",
    },
    {
      id: "connections",
      label: "Connections only 🔗",
      description: "Only your connections can see this post",
      icon: "👥",
    },
  ];

  const handleSelect = (option) => {
    setSelected(option.id);
    onSelect(option.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Who can see this post?</h2>
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

        {/* Options */}
        <div className="p-4 space-y-2">
          {visibilityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selected === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{option.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {selected === option.id && (
                  <svg
                    className="w-5 h-5 text-blue-500 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisibilityModal;
