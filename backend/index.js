const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");
const fileEventsRouter = require("./routes/fileEventsRouter");
const authRouter = require("./routes/authRouter");
const pageRouter = require("./routes/pageRouter");

const app = express();
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

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
