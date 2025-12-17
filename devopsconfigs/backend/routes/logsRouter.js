const router = require("express").Router();
const logsController = require("../controllers/LogsController");
const authMiddleware = require("../auth/middleware");

// Get current user's logs
router.route("/my-logs").get(authMiddleware, logsController.getUserLogs);

// Get all logs (admin only)
router.route("/all-logs").get(authMiddleware, logsController.getAllLogs);

module.exports = router;
