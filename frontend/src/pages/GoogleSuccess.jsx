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
      }, 100);

    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-xl">Logging in... 🔄</h2>
    </div>
  );
}

export default GoogleSuccess;