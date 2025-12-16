const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");
const fileEventsRouter = require("./routes/fileEventsRouter");
const authRouter = require("./routes/authRouter");
const pageRouter = require("./routes/pageRouter");
const fs = require("fs");

const app = express();
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:8080", // credentials: true ile * kullanılamaz
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded (max 50MB)'
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
