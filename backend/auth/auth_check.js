const { User } = require("../models/User");
const jsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jsonWebToken.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById({ id: decoded.id });
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
