const User = require("../models/User");
const File = require("../models/File.js");

async function dashboard_request(req, res) {
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
  return res.status(200).json({
    data: files,
    status: "succes",
    message: "files found",
  });
}
