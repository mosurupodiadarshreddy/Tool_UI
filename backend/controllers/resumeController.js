const { containerClient } = require("../config/azureStorage");

// Upload resume to Azure Blob Storage
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume",
      });
    }

    // Create a unique filename for the uploaded resume
    const blobName = `${Date.now()}-${req.file.originalname}`;

    // Get a client for the new blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the resume buffer to Azure
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Resume uploaded to Azure Storage successfully",
      fileName: req.file.originalname,
      blobName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Resume upload failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume to Azure Storage",
    });
  }
};

module.exports = { uploadResume };