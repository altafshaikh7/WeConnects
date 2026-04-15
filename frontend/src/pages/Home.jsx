import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import NewsSection from "../components/NewsSection";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // ✅ SAFE AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bg-[#f3f2ef] min-h-screen">

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 mt-4">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar />
          </div>

          {/* FEED (MAIN) */}
          <div className="col-span-1 lg:col-span-6">
            <Feed />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3">
            <NewsSection />
          </div>

        </div>

      </div>

      {/* ✅ OPTIONAL MOBILE FIX (BOTTOM NAV FEEL) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-xs sm:hidden">
        <span>🏠</span>
        <span>👥</span>
        <span>➕</span>
        <span>💬</span>
        <span>👤</span>
      </div>

    </div>
  );
}

export default Home;