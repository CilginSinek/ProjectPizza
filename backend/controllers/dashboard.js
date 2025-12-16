const User = require("../models/User");
const File = require("../models/File.js");
const Event = require("../models/Events.js");

async function dashboard_request(req, res) {
  try {
    const files = await File.find({ uploader: req.user._id });
    if (files.length == 0)
      return res
        .status(200)
        .json({ data: null, status: "success", message: "No files found" });
    files.map((file) => {
      return {
        id: file._id,
        name: file.name,
        size: file.size,
        uploadedAt: file.uploadedAt,
        expiresAt: file.expiresAt,
        accessType: file.accessType,
        downloadCount: file.downloadCount,
        downloadLimit: file.downloadLimit,
        status:
          file.downloadCount == file.downloadLimit ? "limit_reached" : "active",
        sharedLink: "",
      };
    });
    const event = new Event({
      eventType: "dashboard_access",
      userId: req.user._id,
    });
    await event.save();
    return res.status(200).json({
      data: files,
      status: "success",
      message: "files found",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching dashboard data",
    });
  }
}
