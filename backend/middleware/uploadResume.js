const multer = require("multer");

// Configure where uploaded files are temporarily stored
const storage = multer.memoryStorage();

// Configure Multer to receive the uploaded file
const uploadResume = multer({
  storage: storage,
});

// Export Multer middleware
module.exports = uploadResume;