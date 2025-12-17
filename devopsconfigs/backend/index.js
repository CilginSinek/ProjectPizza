const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");
const fileEventsRouter = require("./routes/fileEventsRouter");
const authRouter = require("./routes/authRouter");
const pageRouter = require("./routes/pageRouter");
const logsRouter = require("./routes/logsRouter");
const fs = require("fs");
const { initRedis } = require("./utils/redisClient");

const app = express();
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Initialize Redis
initRedis().catch((err) => console.error("Redis initialization failed:", err));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:8080", // credentials: true ile * kullanılamaz
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10gb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded (max 10GB)'
}));
app.use(express.urlencoded({ limit: '10gb', extended: true }));

if (fs.existsSync("./encrypted") === false) {
  fs.mkdirSync("./encrypted");
}

if (fs.existsSync("./decrypted") === false) {
  fs.mkdirSync("./decrypted");
}

app.get("/health", (req, res) => { res.status(200).send("OK"); });

app.get("/healthy_check", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

app.use("/api/files", fileEventsRouter);
app.use("/api/auth", authRouter);
app.use("/api/pages", pageRouter);
app.use("/api/logs", logsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
