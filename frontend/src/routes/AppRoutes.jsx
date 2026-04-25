import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Network from "../pages/Network";
import Messages from "../pages/Messages";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";  // 👈 ADD THIS

// 👇 NEW IMPORTS
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import GoogleSuccess from "../pages/GoogleSuccess";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 AUTH ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🏠 MAIN APP */}
        <Route path="/home" element={<Home />} />
        <Route path="/network" element={<Network />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />  {/* 👈 ADD THIS */}

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