import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import RightSidebar from "../components/RightSidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="bg-[#f3f2ef] min-h-screen">

      <Navbar />

      <div className="grid grid-cols-12 gap-6 px-10 mt-6">

        <div className="col-span-3">
          <LeftSidebar />
        </div>

        <div className="col-span-6">
          <Feed />
        </div>

        <div className="col-span-3">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}

export default Home;