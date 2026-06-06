const express = require("express");
const uploadController = require("../controllers/upload.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/image", authenticate, upload.single("image"), uploadController.uploadImage);

module.exports = router;
