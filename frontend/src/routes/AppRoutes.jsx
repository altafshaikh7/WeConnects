import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Profile from "../pages/Profile";

// 👇 NEW IMPORTS
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import GoogleSuccess from "../pages/GoogleSuccess"; // 🔥 ADD THIS

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 AUTH ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🏠 MAIN APP */}
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />

        {/* 🔁 FORGOT PASSWORD FLOW */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔥 GOOGLE LOGIN SUCCESS */}
        <Route path="/google-success" element={<GoogleSuccess />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;