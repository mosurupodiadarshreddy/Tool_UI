
const express = require("express");
const router = express.Router();

// Import the controller that generates AI answers.
const { generateAnswer } = require("../controllers/aiController");

// Handle POST requests for interview questions.
router.post("/answer", generateAnswer);

module.exports = router;
