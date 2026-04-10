import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      alert("Please enter email ❗");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      alert("Reset link sent! Check your email 📩");

      navigate("/");

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f3f2ef]">
      <div className="bg-white p-8 rounded shadow w-[350px]">

        <h2 className="text-xl font-semibold mb-4">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Enter your email to receive a reset link
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-[#0a66c2]"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;