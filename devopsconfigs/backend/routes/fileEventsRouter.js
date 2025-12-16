const router = require("express").Router();
const fileEventsController = require("../controllers/FileEvents");
const authMiddleware = require("../auth/middleware");

router.route("/upload").post(authMiddleware, fileEventsController.uploadFiles);
router
  .route("/download/:id")
  .get(authMiddleware, fileEventsController.downloadFile);
router
  .route("/metadata/:id")
  .get(authMiddleware, fileEventsController.getFileMetadata);
router
  .route("/delete/:id")
  .delete(authMiddleware, fileEventsController.deleteFile);

module.exports = router;
