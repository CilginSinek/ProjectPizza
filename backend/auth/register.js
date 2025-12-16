const { User, findById } = require("../models/User");
const jsonWebToken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

function register(req, res) {
  const { username, email, password } = req.body;
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }
  User.findOne({ $or: [{ username: username }, { email: email }] }).then(
    (existingUser) => {
      if (existingUser) {
        return res
          .status(409)
          .json({
            status: "error",
            message: "Username or email already in use",
          });
      }
      const newUser = new User({ username, email, password });
      newUser
        .save()
        .then(() => {
          return res
            .status(201)
            .json({
              status: "success",
              message: "User registered successfully",
            });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({
              status: "error",
              message: "Server error during registration",
            });
        });
    }
  );
}

module.exports = register;
