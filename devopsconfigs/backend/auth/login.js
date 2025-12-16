const User = require("../models/User");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Authentication failed" });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Authentication failed" });
    }

    const token = jsonWebToken.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({
      data: { token: token },
      status: "success",
      message: "Authentication successful",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Server error during login",
    });
  }
}

module.exports = login;
