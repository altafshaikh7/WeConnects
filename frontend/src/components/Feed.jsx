function Feed() {
  return (
    <div className="space-y-4">

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <input
          placeholder="Start a post"
          className="w-full border px-4 py-2 rounded-full"
        />

        <div className="flex justify-around mt-3 text-sm text-gray-600">
          <span>🎥 Video</span>
          <span>🖼 Photo</span>
          <span>📝 Article</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold">Demo User</h3>
        <p className="text-xs text-gray-500">2h ago</p>

        <p className="mt-2 text-sm">
          This is my first LinkedIn post 🚀
        </p>

        <div className="flex justify-around mt-4 text-gray-600 text-sm">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>🔁 Repost</span>
          <span>📤 Send</span>
        </div>
      </div>

    </div>
  );
}

export default Feed;