const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No token ❌" });
    }

    // 🔥 FIX
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    // ✅ Attach full user object for downstream controllers
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ msg: "Invalid token ❌" });
  }
};

module.exports = auth;