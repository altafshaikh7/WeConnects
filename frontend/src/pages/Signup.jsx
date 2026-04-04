import { useState } from "react";
import Logo from "../components/logo";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");   // 👈 add
  const [email, setEmail] = useState(""); // 👈 add
  const [password, setPassword] = useState(""); // 👈 add

  const navigate = useNavigate();

  // 🔥 API CALL
  const handleSignup = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      console.log(res.data);
      alert("Signup Successful ✅");

      navigate("/"); // login page pe bhej

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Signup Failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center relative">

      <Logo />

      <div className="bg-white w-[380px] p-8 rounded-lg shadow-sm border">

        <h2 className="text-3xl font-semibold mb-1">Sign up</h2>
        <p className="text-gray-500 text-sm mb-6">
          Make the most of your professional life
        </p>

        {/* Name */}
        <label className="text-sm text-gray-700 font-medium">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-400 p-3 rounded-md mt-1 mb-4 outline-none focus:ring-2 focus:ring-[#0a66c2]"
        />

        {/* Email */}
        <label className="text-sm text-gray-700 font-medium">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-400 p-3 rounded-md mt-1 mb-4 outline-none focus:ring-2 focus:ring-[#0a66c2]"
        />

        {/* Password */}
        <label className="text-sm text-gray-700 font-medium">
          Password (6+ characters)
        </label>

        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-400 p-3 rounded-md pr-16 outline-none focus:ring-2 focus:ring-[#0a66c2]"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-[#0a66c2] text-sm cursor-pointer"
          >
            {showPassword ? "hide" : "show"}
          </span>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 mt-4">
          By clicking Agree & Join or Continue, you agree to the{" "}
          <span className="text-[#0a66c2] cursor-pointer">
            User Agreement
          </span>
          ,{" "}
          <span className="text-[#0a66c2] cursor-pointer">
            Privacy Policy
          </span>
          , and{" "}
          <span className="text-[#0a66c2] cursor-pointer">
            Cookie Policy
          </span>.
        </p>

        {/* Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-[#0a66c2] text-white py-3 rounded-full mt-4 font-semibold hover:bg-[#004182]"
        >
          Agree & Join
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-full hover:bg-gray-100 transition">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700">
            Continue with Google
          </span>
        </button>

        {/* Bottom */}
        <p className="mt-5 text-sm text-center">
          Already on LinkedIn?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-[#0a66c2] font-semibold cursor-pointer"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}

export default Signup;