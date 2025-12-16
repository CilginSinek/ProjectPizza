const User = require("../models/User");
const jsonWebToken = require("jsonwebtoken");

require("dotenv").config();

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jsonWebToken.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Unauthorized with error: " + err.message });
  }
}

module.exports = authMiddleware;
