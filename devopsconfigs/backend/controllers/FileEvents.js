const Events = require("../models/Events");
const File = require("../models/File");
const readFile = require("../utils/readFile");
const saveFile = require("../utils/saveFile");
const path = require("path");

const uploadPath = "../encrypted/";
const downloadPath = "../decrypted/";

/**
 * @brief Handles file upload requests.
 * @param {*} req
 * must be of type multipart/form-data with files attached
 * req.files.lenght  == req.body.fileNames.length
 *
 * @returns
 */
async function uploadFiles(req, res) {
  //* Validation of files
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({
      status: "error",
      message: "No files were uploaded.",
      timestamp: new Date().toISOString(),
    });
  }
  //* Validation of access level
  if (
    req.body.accessLevel &&
    !["public", "private", "restricted"].includes(req.body.accessLevel)
  ) {
    return res.status(400).send({
      status: "error",
      message: "Invalid access level specified.",
      timestamp: new Date().toISOString(),
    });
  }
  //* If access level is restricted, validate allowed users
  if (
    req.body.accessLevel === "restricted" &&
    (!req.body.allowedUsers ||
      !Array.isArray(req.body.allowedUsers) ||
      req.body.allowedUsers.length === 0)
  ) {
    return res.status(400).send({
      status: "error",
      message: "Allowed users must be specified for restricted access level.",
      timestamp: new Date().toISOString(),
    });
  }
  const file = req.files;

  //* Validate file names
  if (file.length !== req.body.fileNames.length) {
    return res.status(400).send({
      status: "error",
      message: "Number of files and file names do not match.",
      timestamp: new Date().toISOString(),
    });
  }
  const destinationPath = `${uploadPath}${Date.now()}_${file.name}`;
  const encryption = await saveFile(file.data, destinationPath);
  const newFile = new File({
    filename: req.body.fileNames[0],
    encryption,
    path: destinationPath,
    uploader: req.user._id,
    accessLevel: req.body.accessLevel || "private",
    size: file.size,
    allowedUsers:
      req.body.accessLevel === "restricted" ? req.body.allowedUsers : [],
    downloadLimit: req.body.downloadLimit || null,
    expiresAt:
      req.body.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
    mimetype: file.mimetype,
  });
  await newFile.save();

  // Event logging can be added here
  const eventLog = new Events({
    eventType: "file_upload",
    userId: req.user._id,
    timestamp: new Date(),
    attachments: [newFile._id],
    details: `file uploaded.`,
  });
  await eventLog.save();

  return res.status(201).send({
    status: "success",
    data: newFile,
    message: "File uploaded successfully.",
    timestamp: new Date().toISOString(),
  });
}

async function downloadFile(req, res) {
  try {
    const fileId = parseInt(req.params.id);
    const fileRecord = await File.findById(fileId).select("-encryption");
    if (!fileRecord) {
      return res.status(404).send({
        status: "error",
        message: "File not found.",
        timestamp: new Date().toISOString(),
      });
    }
    // Permission checks can be added here
    if (
      fileRecord.accesesLevel === "private" &&
      !fileRecord.uploader.equals(req.user._id)
    ) {
      return res.status(403).send({
        status: "error",
        message: "You do not have permission to access this file.",
        timestamp: new Date().toISOString(),
      });
    }
    if (
      fileRecord.accesesLevel === "restricted" &&
      !fileRecord.allowedUsers.includes(req.user._id)
    ) {
      return res.status(403).send({
        status: "error",
        message: "You do not have permission to access this file.",
        timestamp: new Date().toISOString(),
      });
    }
    const readablePath = `${downloadPath}${fileRecord.filename}`;
    readFile(fileRecord, readablePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileRecord.filename}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    fileRecord.downloadCount += 1;
    fileRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Extend expiry by 7 days on each download
    await fileRecord.save();
    const eventLog = new Events({
      eventType: "file_download",
      userId: req.user._id,
      timestamp: new Date(),
      attachments: [fileRecord._id],
      details: `File ${fileRecord.filename} downloaded.`,
    });
    await eventLog.save();

    res.download(readablePath, fileRecord.filename, (err) => {
      if (err) {
        return res.status(500).send({
          status: "error",
          message: "Error in downloading file.",
          timestamp: new Date().toISOString(),
        });
      }
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "File download failed: " + error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

async function getFileMetadata(req, res) {
  try {
    const fileId = parseInt(req.params.id);
    const fileRecord = await File.findById(fileId).select("-encryption");
    if (!fileRecord) {
      return res.status(404).send({
        status: "error",
        message: "File not found.",
        timestamp: new Date().toISOString(),
      });
    }
    // Permission checks can be added here
    if (
      fileRecord.accesesLevel === "private" &&
      !fileRecord.uploader.equals(req.user._id)
    ) {
      return res.status(403).send({
        status: "error",
        message: "You do not have permission to access this file metadata.",
        timestamp: new Date().toISOString(),
      });
    }
    if (
      fileRecord.accesesLevel === "restricted" &&
      !fileRecord.allowedUsers.includes(req.user._id)
    ) {
      return res.status(403).send({
        status: "error",
        message: "You do not have permission to access this file metadata.",
        timestamp: new Date().toISOString(),
      });
    }
    fileRecord.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await fileRecord.save();
    readFile(fileRecord, downloadPath + fileRecord.filename);
    fileRecord.encryption = undefined;
    const previewableMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "audio/mpeg",
      "audio/mp3",
    ];

    const eventLog = new Events({
      eventType: "file_metadata_access",
      userId: req.user._id,
      timestamp: new Date(),
      attachments: [fileRecord._id],
      details: `Metadata for file ${fileRecord.filename} accessed.`,
    });
    await eventLog.save();

    if (previewableMimeTypes.includes(fileRecord.mimetype)) {
      const absolutePath = path.resolve(downloadPath + fileRecord.filename);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileRecord.filename}"`
      );
      res.setHeader(
        "X-File-Metadata",
        JSON.stringify({
          status: "success",
          data: fileRecord,
          message: "File metadata retrieved successfully.",
          timestamp: new Date().toISOString(),
        })
      );
      return res.status(200).sendFile(absolutePath);
    }

    return res.status(200).send({
      status: "success",
      data: fileRecord,
      message: "File metadata retrieved successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Failed to retrieve file metadata: " + error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

async function deleteFile(req, res) {
  try {
    const fileId = parseInt(req.params.id);
    const fileRecord = await File.findById(fileId);
    if (!fileRecord) {
      return res.status(404).send({
        status: "error",
        message: "File not found.",
        timestamp: new Date().toISOString(),
      });
    }
    // Permission checks can be added here
    if (!fileRecord.uploader.equals(req.user._id)) {
      return res.status(403).send({
        status: "error",
        message: "You do not have permission to delete this file.",
        timestamp: new Date().toISOString(),
      });
    }
    await fileRecord.remove();
    const eventLog = new Events({
      eventType: "file_deletion",
      userId: req.user._id,
      timestamp: new Date(),
      attachments: [fileRecord._id],
      details: `File ${fileRecord.filename} deleted.`,
    });
    await eventLog.save();
    return res.status(200).send({
      status: "success",
      message: "File deleted successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "File deletion failed: " + error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  uploadFiles,
  downloadFile,
  getFileMetadata,
  deleteFile,
};
