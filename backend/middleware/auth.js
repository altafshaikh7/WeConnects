const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "No token ❌" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ msg: "Invalid token ❌" });
  }
};

module.exports = auth;