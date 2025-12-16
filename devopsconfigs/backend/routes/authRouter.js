const router = require("express").Router();
const login = require("../auth/login");
const register = require("../auth/register");

router.route("/login").post(login);
router.route("/register").post(register);

module.exports = router;
