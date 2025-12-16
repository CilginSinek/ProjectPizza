const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accesesLevel: {
    type: String,
    enum: ["public", "private", "restricted"],
    default: "private",
  },
  size: { type: Number, required: true },
  downloadCount: { type: Number, default: 0 },
  allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downloadLimit: { type: Number, default: null },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  mimetype: { type: String, required: true },
  encryption: {
    wrappedKey: {
      type: Buffer,
      required: true,
    },

    keyIv: {
      type: Buffer,
      required: true,
    },

    keyAuthTag: {
      type: Buffer,
      required: true,
    },

    fileIv: {
      type: Buffer,
      required: true,
    },

    fileAuthTag: {
      type: Buffer,
      required: true,
    },
  },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
