const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventLogSchema = new Schema({
  eventType: { type: String, required: true },
  attachments: [{ type: Schema.Types.ObjectId, ref: "File" }],
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

const EventLog = mongoose.model("EventLog", eventLogSchema);
export default EventLog;
