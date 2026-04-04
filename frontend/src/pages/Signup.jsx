import { useState } from "react";
import Logo from "../components/logo";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    console.log(name, email, password);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col items-center justify-center relative">

      <Logo />

      <div className="bg-white w-[380px] p-8 rounded-lg shadow-sm border">

        <h2 className="text-2xl font-semibold mb-4">Sign up</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-3 rounded mb-3 focus:ring-2 focus:ring-[#0a66c2]"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3 focus:ring-2 focus:ring-[#0a66c2]"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-[#0a66c2]"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-[#0a66c2] text-white py-3 rounded-full font-semibold hover:bg-[#004182]"
        >
          Sign up
        </button>

        <p className="mt-4 text-sm text-center">
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