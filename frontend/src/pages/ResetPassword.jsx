import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token } = useParams(); // 🔑 URL se token aayega
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields ❗");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      alert("Password reset successful ✅");

      navigate("/"); // login page pe bhejo
    } catch (err) {
      alert(err.response?.data?.msg || "Error resetting password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f3f2ef]">
      <div className="bg-white p-8 rounded shadow w-[350px]">

        <h2 className="text-xl font-semibold mb-4">
          Reset Password
        </h2>

        {/* New Password */}
        <input
          type="password"
          placeholder="New password"
          className="w-full border p-3 mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full border p-3 mb-4 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-[#0a66c2] text-white py-2 rounded"
        >
          Reset Password
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;