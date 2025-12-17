const Events = require("../models/Events");

/**
 * Get all events for the authenticated user
 */
async function getUserLogs(req, res) {
	try {
		const logs = await Events.find({ userId: req.user._id })
			.populate("attachments", "filename size mimetype")
			.sort({ timestamp: -1 })
			.limit(100);

		return res.status(200).send({
			status: "success",
			data: logs,
			message: "User logs retrieved successfully.",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return res.status(500).send({
			status: "error",
			message: "Failed to retrieve logs: " + error.message,
			timestamp: new Date().toISOString(),
		});
	}
}

/**
 * Get all events (admin only)
 */
async function getAllLogs(req, res) {
	try {
		// Check if user is admin
		if (req.user.role !== "admin") {
			return res.status(403).send({
				status: "error",
				message: "Access denied. Admin only.",
				timestamp: new Date().toISOString(),
			});
		}

		const logs = await Events.find()
			.populate("userId", "username email")
			.populate("attachments", "filename size mimetype")
			.sort({ timestamp: -1 })
			.limit(500);

		return res.status(200).send({
			status: "success",
			data: logs,
			message: "All logs retrieved successfully.",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return res.status(500).send({
			status: "error",
			message: "Failed to retrieve logs: " + error.message,
			timestamp: new Date().toISOString(),
		});
	}
}

module.exports = {
	getUserLogs,
	getAllLogs,
};
