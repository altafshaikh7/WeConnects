function RightSidebar() {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">

      {/* TITLE */}
      <h2 className="font-semibold text-sm sm:text-base mb-3">
        LinkedIn News
      </h2>

      {/* NEWS LIST */}
      <ul className="text-xs sm:text-sm space-y-2">

        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
          🚀 Startups growing fast
        </li>

        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
          💼 Jobs market update
        </li>

        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
          📈 Tech trends 2026
        </li>

      </ul>

    </div>
  );
}

export default RightSidebar;