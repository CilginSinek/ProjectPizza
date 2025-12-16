const { User } = require("../models/User");
const jsonWebToken = require("jsonwebtoken");

function login(req, res) {
  const { username, password } = req.body;

  User.findOne({ username: username }).then((user) => {
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Authentication failed" });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err || !isMatch) {
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
    });
  });
}

module.exports = login;
