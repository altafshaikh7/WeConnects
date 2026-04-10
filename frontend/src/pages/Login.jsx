import { useState } from "react";
import Logo from "../components/Logo";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🔥 LOGIN API
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);

      alert("Login Successful ✅");
      navigate("/home");

    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  // 🔥 GOOGLE LOGIN
  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center relative">

      <Logo />

      <div className="bg-white w-[380px] p-8 rounded-lg shadow-sm border">

        <h2 className="text-3xl font-semibold mb-1">Sign in</h2>
        <p className="text-gray-500 text-sm mb-6">
          Stay updated on your professional world
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* Email */}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-400 p-3 rounded-md mb-4 outline-none focus:ring-2 focus:ring-[#0a66c2]"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 p-3 rounded-md mb-2 outline-none focus:ring-2 focus:ring-[#0a66c2]"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-[#0a66c2] text-sm cursor-pointer"
          >
            {showPassword ? "hide" : "show"}
          </span>
        </div>

        {/* Forgot Password */}
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-[#0a66c2] text-sm mb-5 cursor-pointer font-medium"
        >
          Forgot password?
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!email || !password}
          className={`w-full py-3 rounded-full font-semibold transition ${
            email && password
              ? "bg-[#0a66c2] text-white hover:bg-[#004182]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Sign in
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        {/* 🔥 GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700">
            Sign in with Google
          </span>
        </button>

        {/* Bottom */}
        <p className="mt-5 text-sm text-center">
          New to LinkedIn?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#0a66c2] font-semibold cursor-pointer"
          >
            Join now
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;