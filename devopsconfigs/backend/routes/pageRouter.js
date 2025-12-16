const router = require("express").Router();
const dashboardController = require("../controllers/dashboard");
const authMiddleware = require("../auth/middleware");

router.route("/dashboard").get(authMiddleware, dashboardController);

module.exports = router;
