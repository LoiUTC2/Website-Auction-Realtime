const express = require("express");
const multer = require("multer");
const { imageStorage } = require("../config/storage");
const resourceController = require("../controllers/resource.controller");

const router = express.Router();
const imageUpload = multer({ storage: imageStorage });

router.post("/upload-image", imageUpload.single("image"), resourceController.imageUpload);

module.exports = router;
