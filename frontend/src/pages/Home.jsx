import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import NewsSection from "../components/NewsSection";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bg-[#f3f2ef] min-h-screen">

      <Navbar />

      {/* ✅ MAIN - Width increase kiya */}
      <div className="max-w-7xl mx-auto px-4 mt-4"> {/* max-w-6xl se badhake 7xl kiya */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar />
          </div>

          {/* FEED - Width kam kiya */}
          <div className="col-span-1 lg:col-span-5">  {/* 6 se 5 kiya */}
            <Feed />
          </div>

          {/* ✅ NEWS SECTION - Width badhaya */}
          <div className="hidden lg:block lg:col-span-4">  {/* 3 se 4 kiya */}
            <NewsSection />
          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;