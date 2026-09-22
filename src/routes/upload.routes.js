const express = require("express");

const upload = require("../middlewares/upload.middleware");

const {
  uploadMultipleImages,
} = require("../controllers/upload.controller");

const router = express.Router();

// ==========================================
// MULTIPLE IMAGE UPLOAD
// ==========================================

router.post(
  "/",
  upload.array("images", 20),
  uploadMultipleImages
);

module.exports = router;