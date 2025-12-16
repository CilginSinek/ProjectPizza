const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const fileSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accesesLevel: { type: String, enum: ["public", "private", "restricted"], default: "private" },
  accessedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const eventLogSchema = new Schema({
  eventType: { type: String, required: true },
  attachments: [{ type: Schema.Types.ObjectId, ref: "File" }],
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

const User = mongoose.model("User", userSchema);
const File = mongoose.model("File", fileSchema);
const EventLog = mongoose.model("EventLog", eventLogSchema);

module.exports = {
  User,
  File,
  EventLog,
};
