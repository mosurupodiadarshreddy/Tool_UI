
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { transcribeSpeech } = require("../controllers/speechController");

// Accept a WAV recording without saving it to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/transcribe", upload.single("audio"), transcribeSpeech);

module.exports = router;
