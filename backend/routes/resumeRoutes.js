const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/uploadResume");
const { uploadResume } = require("../controllers/resumeController");

// Resume upload API
router.post("/upload", uploadMiddleware.single("resume"), uploadResume);

module.exports = router;