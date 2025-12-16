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
  accessedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const File = mongoose.model("File", fileSchema);
export default File;
