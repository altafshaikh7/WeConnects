import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // 🔥 FIX (IMPORTANT)
      setTimeout(() => {
        navigate("/home");
      }, 2000);

    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      
      {/* Loading Content - Only Text, No Background */}
      <div className="text-center">
        {/* "We Connect" Text - Only One */}
        <h1 className="text-5xl md:text-7xl font-bold text-[#0a66c2] mb-8">
          We Connect
        </h1>
        
        {/* Animated Line - Left to Right */}
        <div className="w-64 md:w-96 mx-auto relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1 bg-gray-200 rounded-full w-full"></div>
          </div>
          <div className="relative h-1 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a66c2] to-transparent animate-loading-line"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-loading-line {
          animation: loadingLine 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default GoogleSuccess;